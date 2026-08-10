# DocuMind AI — Document Intelligence Platform for SMEs

> **"Turn business documents into actionable intelligence."**

**Hackathon Problem Statement:** `PS-AI-03: Document Intelligence for SMEs`

DocuMind AI is a full-stack, enterprise-grade AI Document Intelligence platform designed to help Small and Medium-sized Enterprises (SMEs) automatically process, summarize, analyze, and query business paperwork (Invoices, Receipts, Purchase Orders, Quotations, and Contracts).

---

## 🌟 Key Features

1. **Multi-Format Document Upload**: Supports PDF (digital & scanned), PNG, JPG, JPEG, and Word `.docx` files up to 20MB.
2. **Automated Document Classification**: Identifies document category (*Invoice, Receipt, Purchase Order, Quotation, Contract, General*) with confidence scoring.
3. **Structured Field Extraction**: Extracts Vendor Name, Customer, Document #, Date, Due Date, Subtotal, GST/Tax, Total Amount, Payment Method, and Contract clauses.
4. **AI Executive Summaries**: Generates high-level summaries, key financial attributes, and action items.
5. **Important Risk & Issue Detection**: Flags payment deadlines (*"Due in 5 days"*), missing GSTIN numbers, low-confidence extractions, and automatic renewal clauses.
6. **Human-in-the-Loop Review**: Inline editing of extracted fields with automatic 100% confidence updates and audit history logging.
7. **Ask Your Document AI Chatbot**: Context-grounded Q&A chatbot with exact source citations (*"Page 1, Total Section"*).
8. **Visual Analytics Dashboard**: Recharts charts for Document Types breakdown, Monthly volume, Top Vendor Spending, and Financial metrics.
9. **Alert & Triage Center**: Manage payment risk alerts, missing metadata warnings, and low-confidence flags with 1-click resolution.
10. **Multi-Format Export**: Export intelligence reports as **CSV**, **JSON**, or generated **PDF Report**.
11. **Google Sheets Database Integration**: Connect to any Google Sheets spreadsheet to automatically append every processed document as a structured row.
12. **Demo AI Mode**: Built-in intelligent heuristic engine that operates 100% offline without requiring external API keys.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Recharts, Axios, React Router DOM v6.
- **Backend**: Python 3.13, Flask 3, Flask-CORS, Flask-SQLAlchemy, PyMuPDF (`fitz`), `python-docx`, `Pillow`, `pytesseract`, `reportlab`.
- **Database**: SQLite (`documind.db`).
- **AI Service**: Dual-mode engine supporting Google Gemini API / OpenAI API, with built-in heuristic fallback.

---

## 📁 Project Structure

```text
ai document reader/
├── backend/
│   ├── app.py                 # Main Flask Application & Blueprints
│   ├── database.py            # SQLAlchemy Instance
│   ├── models.py              # User, Document, ExtractedField, Alert, ChatMessage, ActivityLog
│   ├── routes/                # Auth, Documents, Analytics, Alerts API endpoints
│   ├── services/
│   │   ├── ai_service.py      # Dual-mode AI Engine & Chat Grounding
│   │   ├── ocr_service.py     # PyMuPDF, docx, Pillow, Tesseract OCR
│   │   ├── document_service.py# Sample Demo Seeding Engine
│   │   └── export_service.py  # CSV, JSON, and PDF Report Generators
│   ├── uploads/               # Stored uploaded files
│   ├── requirements.txt       # Python dependencies
│   └── .env.example           # Environment variables sample
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar, StatusBadge, ConfidenceBadge, ProcessingModal
│   │   ├── pages/             # Landing, Login, Register, Dashboard, Upload, Details, Catalog, Assistant, Analytics, Alerts, Settings, Help
│   │   ├── context/           # ThemeContext (Dark/Light), AuthContext
│   │   ├── services/          # Axios API Service
│   │   ├── App.jsx            # Router & Layout
│   │   └── index.css          # Tailwind CSS & Glassmorphism styles
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the Flask API Server (runs on http://127.0.0.1:5000)
python app.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node packages
npm install --legacy-peer-deps

# Start Vite Development Server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Variables (`.env`)

Create `backend/.env`:

```env
PORT=5000
FLASK_ENV=development
SECRET_KEY=documind_secret_key_hackathon_2026

# Optional: Add Gemini / OpenAI API key if desired.
# If left blank, system automatically operates in 100% Demo AI Mode!
AI_PROVIDER=demo
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
```

---

## ⚡ Demo Mode (Hackathon Showcase)

1. Launch the application and click **"Try Demo Mode"** on the landing page or navbar.
2. The database will automatically populate with sample documents:
   - **ABC Suppliers Invoice (INV-1025)**: ₹48,500 total, ₹8,730 GST, due 25-Aug-2026.
   - **QuickMart Office Receipt (RCT-8842)**: ₹4,578 corporate credit card receipt.
   - **Vendor Service Agreement (CNT-2026-99)**: ₹25,00,000 agreement with auto-renewal flag.
   - **Tech Solutions Purchase Order (PO-9041)**: ₹75,420 PO.
3. Test uploading any custom PDF or image document to watch the step-by-step processing animation!

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| shadow | -------- | ----------- |
| `POST` | `/api/auth/login` | Instant demo login or credential check |
| `POST` | `/api/documents/upload` | Upload & process document |
| `GET` | `/api/documents` | List & filter documents (search, type, status, confidence) |
| `GET` | `/api/documents/:id` | Fetch document details, fields, alerts, activities & chat |
| `PUT` | `/api/documents/:id/fields/:field_id` | Human-in-the-loop edit field value |
| `POST` | `/api/documents/:id/chat` | Ask Your Document AI chatbot query |
| `GET` | `/api/documents/:id/export?format=pdf` | Export CSV, JSON, or PDF summary report |
| `GET` | `/api/analytics` | Summary metrics & chart data |
| `GET` | `/api/alerts` | Risk alerts list & triage |
| `POST` | `/api/documents/seed-demo` | Populate sample demo paperwork |

---

## 🛡️ Security & Reliability

- **Graceful Fallbacks**: Missing API keys or OCR binary absence will never crash the server.
- **Strict Grounding**: AI Q&A responds exclusively from document context.
- **File Validation**: Enforces extension checks and 20MB file size limits.
