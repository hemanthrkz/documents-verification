import os
from datetime import datetime
from database import db
from models import Document, ExtractedField, Alert, ActivityLog, ChatMessage

def seed_sample_demo_data():
    """
    Populates database with realistic sample documents (Invoice, Receipt, Contract, PO)
    so the user can immediately experience the full workflow in Demo Mode.
    """
    # Check if sample documents already exist
    existing_count = Document.query.filter_by(is_demo=True).count()
    if existing_count >= 4:
        return {"message": "Demo sample documents already loaded", "count": existing_count}

    demo_docs = [
        {
            "filename": "sample_invoice_INV1025.pdf",
            "original_filename": "ABC_Suppliers_Invoice_INV1025.pdf",
            "file_type": "pdf",
            "file_size": 142050,
            "document_type": "Invoice",
            "status": "Processed",
            "confidence": 94.5,
            "vendor_name": "ABC Suppliers Pvt Ltd",
            "customer_name": "XYZ Electronics",
            "document_number": "INV-1025",
            "document_date": "10-Aug-2026",
            "due_date": "25-Aug-2026",
            "subtotal": 39770.0,
            "tax_amount": 8730.0,
            "total_amount": 48500.0,
            "currency": "₹",
            "summary": "ABC Suppliers issued an invoice to XYZ Electronics for ₹48,500 including ₹8,730 GST for Arduino boards and sensors. Payment is due on 25-Aug-2026.",
            "raw_text": """ABC Suppliers Pvt Ltd
GSTIN: 27AAAAA0000A1Z5
Invoice Number: INV-1025
Invoice Date: 10-Aug-2026
Payment Due Date: 25-Aug-2026

Customer: XYZ Electronics
Bill To: 45 Tech Park, Electronic City, Bengaluru

Items:
1. Arduino Uno Boards - Qty: 10 - Rate: ₹3,000 - Amount: ₹30,000
2. Ultrasonic & Temp Sensors - Qty: 5 - Rate: ₹1,954 - Amount: ₹9,770

Subtotal: ₹39,770.00
GST (18%): ₹8,730.00
TOTAL AMOUNT DUE: ₹48,500.00

Payment Terms: Net 15 days. Direct Bank Transfer accepted.""",
            "fields": [
                ("Vendor Name", "vendor_name", "ABC Suppliers Pvt Ltd", 98.0),
                ("Customer Name", "customer_name", "XYZ Electronics", 94.0),
                ("Invoice Number", "document_number", "INV-1025", 99.0),
                ("Invoice Date", "document_date", "10-Aug-2026", 96.0),
                ("Payment Due Date", "due_date", "25-Aug-2026", 91.0),
                ("Subtotal", "subtotal", "₹39,770.00", 95.0),
                ("GST (18%)", "tax_amount", "₹8,730.00", 88.0),
                ("Total Amount", "total_amount", "₹48,500.00", 97.0),
                ("Payment Terms", "payment_terms", "Net 15 Days", 92.0)
            ],
            "alerts": [
                ("Payment Deadline", "high", "Payment Due in 5 Days", "Invoice INV-1025 for ₹48,500 is due on 25-Aug-2026. Schedule payment to avoid late fees."),
                ("Missing Information", "medium", "GSTIN Format Verification", "Vendor GSTIN verified. Input tax credit eligible.")
            ]
        },
        {
            "filename": "sample_receipt_RCT8842.png",
            "original_filename": "QuickMart_Office_Receipt.png",
            "file_type": "png",
            "file_size": 89400,
            "document_type": "Receipt",
            "status": "Processed",
            "confidence": 92.0,
            "vendor_name": "QuickMart Retail Stores",
            "customer_name": "XYZ Electronics",
            "document_number": "RCT-8842",
            "document_date": "08-Aug-2026",
            "due_date": "08-Aug-2026",
            "subtotal": 4200.0,
            "tax_amount": 378.0,
            "total_amount": 4578.0,
            "currency": "₹",
            "summary": "QuickMart Retail issued receipt RCT-8842 for office stationery purchases totaling ₹4,578 paid via Corporate Credit Card.",
            "raw_text": """QUICKMART RETAIL STORES
Store #402, MG Road, Bengaluru
Date: 08-Aug-2026 | Time: 14:22 PM
Receipt #: RCT-8842

Items Purchased:
1. Executive A4 Paper Rims (x5) - ₹2,000
2. Gel Pens Pack & Markers - ₹1,200
3. Sticky Notes & Folders - ₹1,000

Subtotal: ₹4,200.00
CGST + SGST (9%): ₹378.00
Grand Total: ₹4,578.00
Payment Method: Corporate Credit Card ****4192""",
            "fields": [
                ("Merchant", "vendor_name", "QuickMart Retail Stores", 96.0),
                ("Receipt Number", "document_number", "RCT-8842", 95.0),
                ("Date", "document_date", "08-Aug-2026", 94.0),
                ("Subtotal", "subtotal", "₹4,200.00", 91.0),
                ("Tax Amount", "tax_amount", "₹378.00", 89.0),
                ("Total Paid", "total_amount", "₹4,578.00", 97.0),
                ("Payment Method", "payment_method", "Corporate Credit Card (4192)", 93.0)
            ],
            "alerts": []
        },
        {
            "filename": "sample_contract_CNT2026.docx",
            "original_filename": "Master_Vendor_Service_Contract.docx",
            "file_type": "docx",
            "file_size": 215000,
            "document_type": "Contract",
            "status": "Needs Review",
            "confidence": 78.5,
            "vendor_name": "Global Software Solutions Ltd",
            "customer_name": "XYZ Electronics",
            "document_number": "CNT-2026-99",
            "document_date": "01-Aug-2026",
            "due_date": "31-Jul-2027",
            "subtotal": 2118644.0,
            "tax_amount": 381356.0,
            "total_amount": 2500000.0,
            "currency": "₹",
            "summary": "Master Vendor Agreement between Global Software Solutions Ltd and XYZ Electronics valued at ₹25,00,000 annually with automatic 1-year renewal provision.",
            "raw_text": """MASTER SERVICE AGREEMENT
Contract Ref: CNT-2026-99
Effective Date: 01-Aug-2026
Term Expiration Date: 31-Jul-2027

PARTIES:
1. Global Software Solutions Ltd ("Provider")
2. XYZ Electronics ("Client")

ANNUAL CONTRACT VALUE: ₹25,00,000 (Twenty Five Lakhs INR) payable quarterly.

CLAUSE 8.2 — AUTOMATIC RENEWAL:
This Agreement shall automatically renew for successive terms of 12 months unless either party provides written notice of non-renewal at least 60 calendar days prior to expiration.

CLAUSE 12.1 — JURISDICTION & GOVERNING LAW:
Governed by the laws of India and subject to arbitration in Bengaluru.""",
            "fields": [
                ("Primary Vendor", "vendor_name", "Global Software Solutions Ltd", 94.0),
                ("Client Name", "customer_name", "XYZ Electronics", 95.0),
                ("Contract Ref", "document_number", "CNT-2026-99", 98.0),
                ("Effective Date", "document_date", "01-Aug-2026", 92.0),
                ("Expiration Date", "due_date", "31-Jul-2027", 89.0),
                ("Annual Contract Value", "total_amount", "₹25,00,000.00", 90.0),
                ("Renewal Term", "renewal_terms", "Automatic 1-Year Renewal (60-day notice)", 85.0)
            ],
            "alerts": [
                ("Important Clause", "medium", "Automatic Renewal Clause Detected", "Contract CNT-2026-99 contains an automatic 12-month renewal provision. Notice required 60 days before 31-Jul-2027."),
                ("Low Confidence", "high", "Confidence Flag: 78.5%", "Extracted value confidence falls below 80%. Manual legal review recommended.")
            ]
        },
        {
            "filename": "sample_po_PO9041.pdf",
            "original_filename": "Tech_Solutions_Purchase_Order.pdf",
            "file_type": "pdf",
            "file_size": 110000,
            "document_type": "Purchase Order",
            "status": "Processed",
            "confidence": 96.2,
            "vendor_name": "Tech Solutions Ltd",
            "customer_name": "XYZ Electronics",
            "document_number": "PO-9041",
            "document_date": "05-Aug-2026",
            "due_date": "18-Aug-2026",
            "subtotal": 63915.0,
            "tax_amount": 11505.0,
            "total_amount": 75420.0,
            "currency": "₹",
            "summary": "Purchase Order PO-9041 issued to Tech Solutions Ltd for server hardware and networking equipment totaling ₹75,420 with delivery expected by 18-Aug-2026.",
            "raw_text": """PURCHASE ORDER
PO Number: PO-9041
Date: 05-Aug-2026
Delivery Expected Date: 18-Aug-2026

Vendor: Tech Solutions Ltd
Buyer: XYZ Electronics

Order Items:
1. Rack Mount Switches (x2) - ₹40,000
2. Cat6 Ethernet Cables (100m) - ₹23,915

Subtotal: ₹63,915.00
Tax (18%): ₹11,505.00
Total Purchase Order Value: ₹75,420.00""",
            "fields": [
                ("Vendor", "vendor_name", "Tech Solutions Ltd", 97.0),
                ("Buyer", "customer_name", "XYZ Electronics", 96.0),
                ("PO Number", "document_number", "PO-9041", 99.0),
                ("PO Date", "document_date", "05-Aug-2026", 96.0),
                ("Expected Delivery", "due_date", "18-Aug-2026", 93.0),
                ("Subtotal", "subtotal", "₹63,915.00", 94.0),
                ("Tax Amount", "tax_amount", "₹11,505.00", 91.0),
                ("Total PO Amount", "total_amount", "₹75,420.00", 98.0)
            ],
            "alerts": [
                ("Payment Deadline", "medium", "Delivery Expected Soon", "Purchase order PO-9041 delivery expected on 18-Aug-2026.")
            ]
        }
    ]

    added_count = 0
    for doc_info in demo_docs:
        doc = Document(
            filename=doc_info["filename"],
            original_filename=doc_info["original_filename"],
            file_path=os.path.join("sample_documents", doc_info["filename"]),
            file_type=doc_info["file_type"],
            file_size=doc_info["file_size"],
            document_type=doc_info["document_type"],
            status=doc_info["status"],
            confidence=doc_info["confidence"],
            vendor_name=doc_info["vendor_name"],
            customer_name=doc_info["customer_name"],
            document_number=doc_info["document_number"],
            document_date=doc_info["document_date"],
            due_date=doc_info["due_date"],
            subtotal=doc_info["subtotal"],
            tax_amount=doc_info["tax_amount"],
            total_amount=doc_info["total_amount"],
            currency=doc_info["currency"],
            summary=doc_info["summary"],
            raw_text=doc_info["raw_text"],
            is_demo=True,
            uploaded_at=datetime.utcnow(),
            processed_at=datetime.utcnow()
        )
        db.session.add(doc)
        db.session.commit()

        # Add fields
        for fname, fkey, fval, fconf in doc_info["fields"]:
            field = ExtractedField(
                document_id=doc.id,
                field_name=fname,
                field_key=fkey,
                field_value=fval,
                confidence=fconf
            )
            db.session.add(field)

        # Add alerts
        for atype, asev, atitle, amsg in doc_info["alerts"]:
            alert = Alert(
                document_id=doc.id,
                type=atype,
                severity=asev,
                title=atitle,
                message=amsg,
                status="active"
            )
            db.session.add(alert)

        # Add initial activity log
        log1 = ActivityLog(document_id=doc.id, action="Document uploaded into Demo System")
        log2 = ActivityLog(document_id=doc.id, action="OCR & Text Extraction completed")
        log3 = ActivityLog(document_id=doc.id, action="AI Information & Structured Data extracted successfully")
        db.session.add_all([log1, log2, log3])

        # Add initial chat Q&A welcome sample message
        chat1 = ChatMessage(
            document_id=doc.id,
            role="assistant",
            message=f"Hello! I am DocuMind AI. Ask me any question about {doc.original_filename}.",
            source_reference="System Assistant"
        )
        db.session.add(chat1)

        db.session.commit()
        added_count += 1

    return {"message": "Demo sample documents seeded successfully", "count": added_count}
