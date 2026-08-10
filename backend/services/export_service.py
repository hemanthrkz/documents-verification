import io
import csv
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_csv_export(document, extracted_fields):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(['DocuMind AI Document Intelligence Export'])
    writer.writerow(['Document ID', document.id])
    writer.writerow(['Document Name', document.original_filename])
    writer.writerow(['Document Type', document.document_type])
    writer.writerow(['Confidence Score', f"{document.confidence}%"])
    writer.writerow(['Uploaded At', document.uploaded_at.isoformat() if document.uploaded_at else ''])
    writer.writerow([])
    writer.writerow(['Field Name', 'Field Value', 'Confidence Score', 'Human Edited'])
    
    for f in extracted_fields:
        writer.writerow([f.field_name, f.field_value, f"{f.confidence}%", "Yes" if f.is_edited else "No"])
        
    writer.writerow([])
    writer.writerow(['AI Summary', document.summary or ''])
    return output.getvalue()

def generate_json_export(document, extracted_fields):
    data = {
        "metadata": {
            "document_id": document.id,
            "filename": document.original_filename,
            "document_type": document.document_type,
            "status": document.status,
            "confidence": document.confidence,
            "uploaded_at": document.uploaded_at.isoformat() if document.uploaded_at else None,
            "vendor_name": document.vendor_name,
            "customer_name": document.customer_name,
            "document_number": document.document_number,
            "document_date": document.document_date,
            "due_date": document.due_date,
            "total_amount": document.total_amount,
            "tax_amount": document.tax_amount,
            "currency": document.currency or '₹'
        },
        "summary": document.summary,
        "extracted_fields": [f.to_dict() for f in extracted_fields],
        "raw_text": document.raw_text
    }
    return json.dumps(data, indent=2)

def generate_pdf_report(document, extracted_fields):
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#1E293B'), spaceAfter=10)
    subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#64748B'), spaceAfter=15)
    section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#0F172A'), spaceBefore=12, spaceAfter=8)
    body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#334155'), leading=14)

    elements = []

    # Title & Branding
    elements.append(Paragraph("<b>DocuMind AI</b> — Intelligence Report", title_style))
    elements.append(Paragraph(f"Document: <b>{document.original_filename}</b> | Generated on {document.uploaded_at.strftime('%b %d, %Y') if document.uploaded_at else 'Today'}", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E1'), spaceAfter=15))

    # Metadata Summary Box
    currency = document.currency or '₹'
    amt_str = f"{currency} {document.total_amount:,.2f}" if document.total_amount else "N/A"
    meta_data = [
        [Paragraph("<b>Document Type:</b>", body_style), Paragraph(document.document_type, body_style), Paragraph("<b>Status:</b>", body_style), Paragraph(document.status, body_style)],
        [Paragraph("<b>Vendor Name:</b>", body_style), Paragraph(document.vendor_name or "N/A", body_style), Paragraph("<b>Confidence Score:</b>", body_style), Paragraph(f"<b>{document.confidence}%</b>", body_style)],
        [Paragraph("<b>Document #:</b>", body_style), Paragraph(document.document_number or "N/A", body_style), Paragraph("<b>Total Amount:</b>", body_style), Paragraph(amt_str, body_style)],
        [Paragraph("<b>Doc Date:</b>", body_style), Paragraph(document.document_date or "N/A", body_style), Paragraph("<b>Due Date:</b>", body_style), Paragraph(document.due_date or "N/A", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[110, 160, 110, 160])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#F1F5F9')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 15))

    # AI Summary Section
    elements.append(Paragraph("AI Executive Summary", section_style))
    summary_text = document.summary or "No summary available for this document."
    elements.append(Paragraph(summary_text, body_style))
    elements.append(Spacer(1, 15))

    # Extracted Fields Table
    elements.append(Paragraph("Extracted Information Fields", section_style))
    table_data = [[Paragraph("<b>Field Name</b>", body_style), Paragraph("<b>Extracted Value</b>", body_style), Paragraph("<b>Confidence</b>", body_style)]]
    for field in extracted_fields:
        table_data.append([
            Paragraph(field.field_name, body_style),
            Paragraph(str(field.field_value or "N/A"), body_style),
            Paragraph(f"{field.confidence}%", body_style)
        ])
    field_table = Table(table_data, colWidths=[160, 260, 120])
    field_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EEF2FF')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#312E81')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#C7D2FE')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E0E7FF')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(field_table)
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("<i>Report generated automatically by DocuMind AI Document Intelligence Platform.</i>", subtitle_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
