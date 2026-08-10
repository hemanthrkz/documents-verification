import os
import werkzeug.utils
from flask import Blueprint, request, jsonify, Response, send_file
from datetime import datetime
from database import db
from models import Document, ExtractedField, Alert, ActivityLog, ChatMessage
from services.ocr_service import extract_text_from_file
from services.ai_service import AIService
from services.export_service import generate_csv_export, generate_json_export, generate_pdf_report
from services.google_sheets_service import sync_document_to_google_sheet, sync_all_documents_to_google_sheet, generate_google_apps_script_code, DUMMY_URL_MARKER

documents_bp = Blueprint('documents', __name__)
ai_service = AIService()

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'docx'}
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documents_bp.route('/seed-demo', methods=['POST'])
def seed_demo():
    res = seed_sample_demo_data()
    return jsonify(res), 200

@documents_bp.route('/clear-all', methods=['DELETE', 'POST'])
def clear_all_documents():
    try:
        ExtractedField.query.delete()
        Alert.query.delete()
        ChatMessage.query.delete()
        ActivityLog.query.delete()
        Document.query.delete()
        db.session.commit()
        return jsonify({'message': 'All document data cleared successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@documents_bp.route('/google-script-code', methods=['GET'])
def get_google_script():
    return jsonify({
        'code': generate_google_apps_script_code(),
        'webhook_url': os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "") if DUMMY_URL_MARKER not in os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "") else ""
    }), 200

@documents_bp.route('/save-webhook-url', methods=['POST'])
def save_webhook_url():
    data = request.get_json() or {}
    webhook_url = data.get('webhook_url', '').strip()
    os.environ["GOOGLE_SHEET_WEBHOOK_URL"] = webhook_url
    return jsonify({'message': 'Webhook URL updated successfully', 'webhook_url': webhook_url}), 200

@documents_bp.route('/sync-all-sheets', methods=['POST'])
def sync_all_to_google_sheets():
    data = request.get_json() or {}
    webhook_url = data.get('webhook_url', None) or os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "")
    
    docs = Document.query.all()
    if not docs:
        return jsonify({'success': False, 'message': 'No documents found in local database to sync'}), 400
        
    res = sync_all_documents_to_google_sheet(docs, webhook_url)
    if res.get('success'):
        if webhook_url:
            os.environ["GOOGLE_SHEET_WEBHOOK_URL"] = webhook_url
        return jsonify(res), 200
    else:
        return jsonify(res), 400

@documents_bp.route('/<int:doc_id>/sync-sheets', methods=['POST'])
def sync_to_google_sheets(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    data = request.get_json() or {}
    webhook_url = data.get('webhook_url', None)

    res = sync_document_to_google_sheet(doc, doc.extracted_fields, webhook_url)
    if res.get('success'):
        if webhook_url:
            os.environ["GOOGLE_SHEET_WEBHOOK_URL"] = webhook_url
        db.session.add(ActivityLog(document_id=doc.id, action="Synced row data to Google Sheet database"))
        db.session.commit()
        return jsonify(res), 200
    else:
        return jsonify(res), 400



import re
import threading

def safe_float(val):
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    try:
        clean_str = re.sub(r'[^\d\.]', '', str(val))
        return float(clean_str) if clean_str else None
    except Exception:
        return None

def _bg_sync_document(app_obj, doc_id, webhook_url):
    with app_obj.app_context():
        try:
            doc = Document.query.get(doc_id)
            if doc:
                sync_res = sync_document_to_google_sheet(doc, doc.extracted_fields, webhook_url)
                if sync_res.get('success'):
                    db.session.add(ActivityLog(document_id=doc.id, action="Auto-synced document row to Google Sheet"))
                    db.session.commit()
        except Exception as err:
            print(f"[Background Google Sheet Sync Notice]: {err}")

@documents_bp.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': f'Invalid file type. Supported formats: {", ".join(ALLOWED_EXTENSIONS)}'}), 400

    user_doc_type = request.form.get('document_type', None)

    display_filename = file.filename or "uploaded_document"
    if '.' in display_filename:
        file_ext = display_filename.rsplit('.', 1)[1].lower()
        base_name = display_filename.rsplit('.', 1)[0]
    else:
        file_ext = 'pdf'
        base_name = display_filename

    safe_base = werkzeug.utils.secure_filename(base_name) or 'document'
    timestamp_str = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    saved_filename = f"{timestamp_str}_{safe_base}.{file_ext}"
    file_path = os.path.join(UPLOAD_FOLDER, saved_filename)

    try:
        file.save(file_path)
        file_size = os.path.getsize(file_path)

        # 1. OCR / Text Extraction
        raw_text = extract_text_from_file(file_path, file_ext)

        # 2. AI Understanding & Extraction
        ai_result = ai_service.process_document(raw_text, display_filename, user_doc_type)

        conf_val = safe_float(ai_result.get('confidence'))
        confidence = conf_val if conf_val is not None else 90.0

        # 3. Create Document Record
        doc = Document(
            filename=saved_filename,
            original_filename=display_filename,
            file_path=file_path,
            file_type=file_ext,
            file_size=file_size,
            document_type=ai_result.get('document_type', 'General'),
            status='Needs Review' if confidence < 80.0 else 'Processed',
            confidence=confidence,
            vendor_name=ai_result.get('vendor_name'),
            customer_name=ai_result.get('customer_name'),
            document_number=ai_result.get('document_number'),
            document_date=ai_result.get('document_date'),
            due_date=ai_result.get('due_date'),
            subtotal=safe_float(ai_result.get('subtotal')),
            tax_amount=safe_float(ai_result.get('tax_amount')),
            total_amount=safe_float(ai_result.get('total_amount')),
            currency=ai_result.get('currency', '₹'),
            summary=ai_result.get('summary'),
            raw_text=raw_text,
            uploaded_at=datetime.utcnow(),
            processed_at=datetime.utcnow()
        )
        db.session.add(doc)
        db.session.commit()

        # 4. Save Extracted Fields
        for field in ai_result.get('extracted_fields', []):
            field_conf = safe_float(field.get('confidence'))
            f = ExtractedField(
                document_id=doc.id,
                field_name=field.get('field_name', 'Field'),
                field_key=field.get('field_key', 'field_key'),
                field_value=str(field.get('field_value', '')),
                confidence=field_conf if field_conf is not None else 90.0
            )
            db.session.add(f)

        # 5. Save Risk Alerts
        for alert_info in ai_result.get('alerts', []):
            alert = Alert(
                document_id=doc.id,
                type=alert_info.get('type', 'General Alert'),
                severity=alert_info.get('severity', 'medium'),
                title=alert_info.get('title', 'Notification'),
                message=alert_info.get('message', ''),
                status='active'
            )
            db.session.add(alert)

        # 6. Save Activity Logs
        db.session.add(ActivityLog(document_id=doc.id, action="File uploaded and stored safely"))
        db.session.add(ActivityLog(document_id=doc.id, action=f"OCR Text Extraction completed ({len(raw_text)} characters)"))
        db.session.add(ActivityLog(document_id=doc.id, action=f"AI Processed & Classified as {doc.document_type} (Confidence: {doc.confidence}%)"))

        # Initial Welcome Chat Message
        db.session.add(ChatMessage(
            document_id=doc.id,
            role="assistant",
            message=f"Hello! I'm ready to answer questions about {display_filename}.",
            source_reference="System Ready"
        ))

        db.session.commit()

        # 7. Auto-sync to Google Sheets in background thread if configured
        webhook_url = os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "")
        if webhook_url and DUMMY_URL_MARKER not in webhook_url:
            try:
                from flask import current_app
                app_obj = current_app._get_current_object()
                threading.Thread(target=_bg_sync_document, args=(app_obj, doc.id, webhook_url), daemon=True).start()
            except Exception as thread_err:
                print(f"[Async Thread Start Notice]: {thread_err}")

        return jsonify({
            'message': 'Document uploaded and processed successfully',
            'document': doc.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[Document Processing Error]: {e}")
        return jsonify({
            'error': f'Document processing failed: {str(e)}'
        }), 500



@documents_bp.route('', methods=['GET'])
def get_documents():
    query = request.args.get('search', '').strip().lower()
    doc_type = request.args.get('type', 'All')
    status = request.args.get('status', 'All')
    confidence_filter = request.args.get('confidence', 'All')

    # Query DB
    docs_query = Document.query.order_by(Document.uploaded_at.desc())

    if doc_type and doc_type != 'All':
        docs_query = docs_query.filter(Document.document_type == doc_type)

    if status and status != 'All':
        docs_query = docs_query.filter(Document.status == status)

    all_docs = docs_query.all()
    filtered_docs = []

    for doc in all_docs:
        # Search match
        if query:
            searchable = f"{doc.original_filename} {doc.vendor_name or ''} {doc.document_number or ''} {doc.raw_text or ''} {doc.summary or ''}".lower()
            if query not in searchable:
                continue

        # Confidence filter
        if confidence_filter == 'High' and doc.confidence < 90:
            continue
        elif confidence_filter == 'Medium' and (doc.confidence < 75 or doc.confidence >= 90):
            continue
        elif confidence_filter == 'Low' and doc.confidence >= 75:
            continue

        filtered_docs.append(doc.to_dict())

    return jsonify({'documents': filtered_docs, 'count': len(filtered_docs)}), 200

@documents_bp.route('/<int:doc_id>', methods=['GET'])
def get_document_details(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    fields = [f.to_dict() for f in doc.extracted_fields]
    alerts = [a.to_dict() for a in doc.alerts]
    activities = [act.to_dict() for act in doc.activities]
    chat_messages = [c.to_dict() for c in doc.messages]

    return jsonify({
        'document': doc.to_dict(),
        'extracted_fields': fields,
        'alerts': alerts,
        'activities': activities,
        'chat_messages': chat_messages
    }), 200

@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except Exception as e:
        print(f"Error removing file {doc.file_path}: {e}")

    db.session.delete(doc)
    db.session.commit()
    return jsonify({'message': 'Document deleted successfully'}), 200

@documents_bp.route('/<int:doc_id>/fields/<int:field_id>', methods=['PUT'])
def edit_field(doc_id, field_id):
    """Human-in-the-loop: Edit extracted information."""
    field = ExtractedField.query.get(field_id)
    if not field or field.document_id != doc_id:
        return jsonify({'error': 'Field not found'}), 404

    data = request.get_json() or {}
    new_value = data.get('field_value', '').strip()

    if not field.is_edited:
        field.original_value = field.field_value
        field.is_edited = True

    field.field_value = new_value
    field.confidence = 100.0  # Human corrected value has 100% confidence

    # Sync back to parent Document record if matching core field
    doc = Document.query.get(doc_id)
    if field.field_key == 'vendor_name':
        doc.vendor_name = new_value
    elif field.field_key == 'document_number':
        doc.document_number = new_value
    elif field.field_key == 'due_date':
        doc.due_date = new_value
    elif field.field_key == 'total_amount':
        try:
            doc.total_amount = float(new_value.replace('₹', '').replace('$', '').replace(',', '').strip())
        except:
            pass

    db.session.add(ActivityLog(document_id=doc.id, action=f"User corrected field '{field.field_name}' to '{new_value}'"))
    db.session.commit()

    return jsonify({
        'message': 'Field updated successfully',
        'field': field.to_dict(),
        'document': doc.to_dict()
    }), 200

@documents_bp.route('/<int:doc_id>/chat', methods=['POST'])
def chat_with_document(doc_id):
    """Ask Your Document AI Chatbot"""
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    data = request.get_json() or {}
    user_query = data.get('message', '').strip()
    if not user_query:
        return jsonify({'error': 'Message text is required'}), 400

    # Save user chat message
    user_msg = ChatMessage(document_id=doc.id, role='user', message=user_query)
    db.session.add(user_msg)
    db.session.commit()

    # Get AI response using document metadata and text content
    meta = doc.to_dict()
    ai_res = ai_service.answer_question(user_query, doc.raw_text, meta)

    asst_msg = ChatMessage(
        document_id=doc.id,
        role='assistant',
        message=ai_res.get('answer', "I couldn't find this information in the uploaded document."),
        source_reference=ai_res.get('source_reference', 'Extracted Document Context')
    )
    db.session.add(asst_msg)
    db.session.commit()

    return jsonify({
        'user_message': user_msg.to_dict(),
        'assistant_message': asst_msg.to_dict()
    }), 200

@documents_bp.route('/<int:doc_id>/export', methods=['GET'])
def export_document(doc_id):
    export_format = request.args.get('format', 'csv').lower()
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({'error': 'Document not found'}), 404

    fields = doc.extracted_fields

    if export_format == 'csv':
        content = generate_csv_export(doc, fields)
        return Response(
            content,
            mimetype="text/csv",
            headers={"Content-disposition": f"attachment; filename=DocuMind_Export_{doc.document_number or doc.id}.csv"}
        )
    elif export_format == 'json':
        content = generate_json_export(doc, fields)
        return Response(
            content,
            mimetype="application/json",
            headers={"Content-disposition": f"attachment; filename=DocuMind_Export_{doc.document_number or doc.id}.json"}
        )
    elif export_format == 'pdf':
        pdf_bytes = generate_pdf_report(doc, fields)
        return Response(
            pdf_bytes,
            mimetype="application/pdf",
            headers={"Content-disposition": f"attachment; filename=DocuMind_Report_{doc.document_number or doc.id}.pdf"}
        )
    else:
        return jsonify({'error': 'Invalid export format. Supported formats: csv, json, pdf'}), 400
