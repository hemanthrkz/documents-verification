from datetime import datetime
from database import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    documents = db.relationship('Document', backref='user', lazy=True)

class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    file_size = db.Column(db.Integer, default=0)
    document_type = db.Column(db.String(50), default='Invoice') # Invoice, Receipt, Purchase Order, Quotation, Contract, Other
    status = db.Column(db.String(50), default='Processed') # Processing, Processed, Needs Review, Failed
    confidence = db.Column(db.Float, default=90.0) # Percentage 0 to 100
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)
    raw_text = db.Column(db.Text, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    vendor_name = db.Column(db.String(255), nullable=True)
    customer_name = db.Column(db.String(255), nullable=True)
    document_number = db.Column(db.String(100), nullable=True) # Invoice #, PO #, etc.
    document_date = db.Column(db.String(50), nullable=True)
    due_date = db.Column(db.String(50), nullable=True)
    total_amount = db.Column(db.Float, nullable=True)
    tax_amount = db.Column(db.Float, nullable=True)
    subtotal = db.Column(db.Float, nullable=True)
    currency = db.Column(db.String(10), default='₹')
    is_demo = db.Column(db.Boolean, default=False)

    extracted_fields = db.relationship('ExtractedField', backref='document', cascade='all, delete-orphan', lazy=True)
    alerts = db.relationship('Alert', backref='document', cascade='all, delete-orphan', lazy=True)
    messages = db.relationship('ChatMessage', backref='document', cascade='all, delete-orphan', lazy=True)
    activities = db.relationship('ActivityLog', backref='document', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.original_filename or self.filename,
            'document_type': self.document_type,
            'status': self.status,
            'confidence': round(self.confidence, 1),
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'vendor_name': self.vendor_name,
            'customer_name': self.customer_name,
            'document_number': self.document_number,
            'document_date': self.document_date,
            'due_date': self.due_date,
            'total_amount': self.total_amount,
            'tax_amount': self.tax_amount,
            'subtotal': self.subtotal,
            'currency': self.currency or '₹',
            'summary': self.summary,
            'raw_text': self.raw_text,
            'file_size': self.file_size,
            'is_demo': self.is_demo
        }

class ExtractedField(db.Model):
    __tablename__ = 'extracted_fields'
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    field_name = db.Column(db.String(100), nullable=False) # e.g. "Vendor Name"
    field_key = db.Column(db.String(100), nullable=False) # e.g. "vendor_name"
    field_value = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, default=95.0)
    is_edited = db.Column(db.Boolean, default=False)
    original_value = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'field_name': self.field_name,
            'field_key': self.field_key,
            'field_value': self.field_value,
            'confidence': round(self.confidence, 1),
            'is_edited': self.is_edited,
            'original_value': self.original_value
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)
    type = db.Column(db.String(100), nullable=False) # e.g. "Payment Deadline", "Missing Information", "Clause Warning", "Low Confidence"
    severity = db.Column(db.String(20), default='medium') # high, medium, low
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='active') # active, read, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        doc = Document.query.get(self.document_id) if self.document_id else None
        return {
            'id': self.id,
            'document_id': self.document_id,
            'document_name': doc.original_filename if doc else 'System',
            'document_type': doc.document_type if doc else 'General',
            'type': self.type,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=True)
    role = db.Column(db.String(20), nullable=False) # user, assistant
    message = db.Column(db.Text, nullable=False)
    source_reference = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'role': self.role,
            'message': self.message,
            'source_reference': self.source_reference,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    document_id = db.Column(db.Integer, db.ForeignKey('documents.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'document_id': self.document_id,
            'action': self.action,
            'timestamp': self.timestamp.strftime('%I:%M %p, %b %d, %Y') if self.timestamp else None
        }
