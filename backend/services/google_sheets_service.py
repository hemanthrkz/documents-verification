import os
import requests
import json

DUMMY_URL_MARKER = "AKfycbxmLAVXF8-KnCpoUsriBsINVzPVYX_zBEDDPXFE0XftEaIiXeeSmV-pFgEZoQ39i6vm"

def sync_document_to_google_sheet(document, extracted_fields=None, webhook_url=None):
    """
    Sends document data to a Google Sheets Webhook (Google Apps Script Web App).
    Automatically appends a new row to the user's Google Sheet.
    """
    url = (webhook_url or os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "")).strip()

    if not url or DUMMY_URL_MARKER in url:
        return {
            "success": False,
            "message": "Google Sheets Webhook URL is not configured. Please paste your Google Sheet Web App URL in Settings."
        }

    currency = document.currency or '₹'
    row_data = {
        "document_id": document.id,
        "filename": document.original_filename or document.filename,
        "document_type": document.document_type,
        "vendor_name": document.vendor_name or "N/A",
        "customer_name": document.customer_name or "N/A",
        "document_number": document.document_number or "N/A",
        "document_date": document.document_date or "N/A",
        "due_date": document.due_date or "N/A",
        "subtotal": f"{currency} {document.subtotal:,.2f}" if document.subtotal else "N/A",
        "tax_amount": f"{currency} {document.tax_amount:,.2f}" if document.tax_amount else "N/A",
        "total_amount": f"{currency} {document.total_amount:,.2f}" if document.total_amount else "N/A",
        "confidence": f"{document.confidence}%",
        "status": document.status,
        "summary": document.summary or "",
        "uploaded_at": document.uploaded_at.strftime("%Y-%m-%d %H:%M:%S") if document.uploaded_at else ""
    }

    try:
        response = requests.post(url, json=row_data, headers={"Content-Type": "application/json"}, timeout=12)
        if response.status_code in [200, 201, 302]:
            return {
                "success": True,
                "message": f"Successfully appended '{document.original_filename or document.filename}' row to Google Sheet Database!",
                "synced_data": row_data
            }
        else:
            return {
                "success": False,
                "message": f"Google Sheets Webhook returned HTTP code {response.status_code}"
            }
    except Exception as e:
        print(f"[Google Sheets Sync Error]: {e}")
        return {
            "success": False,
            "message": f"Failed to communicate with Google Sheet Webhook: {str(e)}"
        }

def sync_all_documents_to_google_sheet(documents, webhook_url=None):
    """
    Syncs multiple document records to Google Sheets database in bulk.
    """
    url = (webhook_url or os.getenv("GOOGLE_SHEET_WEBHOOK_URL", "")).strip()

    if not url or DUMMY_URL_MARKER in url:
        return {
            "success": False,
            "message": "Google Sheets Webhook URL is not configured. Please paste your Google Sheet Web App URL in Settings."
        }

    rows = []
    for doc in documents:
        currency = doc.currency or '₹'
        rows.append({
            "document_id": doc.id,
            "filename": doc.original_filename or doc.filename,
            "document_type": doc.document_type,
            "vendor_name": doc.vendor_name or "N/A",
            "customer_name": doc.customer_name or "N/A",
            "document_number": doc.document_number or "N/A",
            "document_date": doc.document_date or "N/A",
            "due_date": doc.due_date or "N/A",
            "subtotal": f"{currency} {doc.subtotal:,.2f}" if doc.subtotal else "N/A",
            "tax_amount": f"{currency} {doc.tax_amount:,.2f}" if doc.tax_amount else "N/A",
            "total_amount": f"{currency} {doc.total_amount:,.2f}" if doc.total_amount else "N/A",
            "confidence": f"{doc.confidence}%",
            "status": doc.status,
            "summary": doc.summary or "",
            "uploaded_at": doc.uploaded_at.strftime("%Y-%m-%d %H:%M:%S") if doc.uploaded_at else ""
        })

    try:
        response = requests.post(url, json=rows, headers={"Content-Type": "application/json"}, timeout=15)
        if response.status_code in [200, 201, 302]:
            return {
                "success": True,
                "message": f"Successfully synced all {len(rows)} documents to Google Sheet Database!",
                "synced_count": len(rows)
            }
        else:
            return {
                "success": False,
                "message": f"Google Sheets Webhook returned code {response.status_code}"
            }
    except Exception as e:
        print(f"[Google Sheets Bulk Sync Error]: {e}")
        return {
            "success": False,
            "message": f"Failed to connect to Google Sheet Webhook: {str(e)}"
        }

def generate_google_apps_script_code():
    """
    Returns the exact Google Apps Script code the user can paste into Google Sheets
    under Extensions -> Apps Script to create a zero-config webhook database!
    """
    return """// Copy and Paste this code into Google Sheets -> Extensions -> Apps Script
// Then click "Deploy" -> "New deployment" -> Select type "Web app"
// Execute as: "Me" -> Who has access: "Anyone"

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    "result": "success",
    "message": "DocuMind AI Google Sheets Webhook Backend is Active and Ready!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Create header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Document ID", 
        "Filename", 
        "Type", 
        "Vendor Name", 
        "Customer Name", 
        "Doc Number", 
        "Doc Date", 
        "Due Date", 
        "Subtotal", 
        "Tax Amount", 
        "Total Amount", 
        "Confidence", 
        "Status", 
        "Summary", 
        "Uploaded At"
      ]);
    }
    
    var data = null;
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    if (!data) {
      return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": "No payload data provided"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        appendSingleRow(sheet, data[i]);
      }
    } else {
      appendSingleRow(sheet, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      "result": "success",
      "message": "DocuMind document row(s) successfully written to Google Sheet Database!"
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      "result": "error", 
      "error": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function appendSingleRow(sheet, data) {
  if (!data) return;
  sheet.appendRow([
    data.document_id || "",
    data.filename || "",
    data.document_type || "",
    data.vendor_name || "N/A",
    data.customer_name || "N/A",
    data.document_number || "N/A",
    data.document_date || "N/A",
    data.due_date || "N/A",
    data.subtotal || "N/A",
    data.tax_amount || "N/A",
    data.total_amount || "N/A",
    data.confidence || "",
    data.status || "",
    data.summary || "",
    data.uploaded_at || ""
  ]);
}
"""
