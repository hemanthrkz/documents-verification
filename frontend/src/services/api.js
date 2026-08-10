import axios from 'axios';

const API_BASE = 'https://documents-verification.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const seedDemoDocuments = async () => {
  const res = await api.post('/documents/seed-demo');
  return res.data;
};

export const clearAllDocuments = async () => {
  const res = await api.delete('/documents/clear-all');
  return res.data;
};

export const getDocuments = async (params = {}) => {
  const res = await api.get('/documents', { params });
  return res.data;
};

export const getDocumentDetails = async (id) => {
  const res = await api.get(`/documents/${id}`);
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await axios.post(`${API_BASE}/documents/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const updateExtractedField = async (docId, fieldId, fieldValue) => {
  const res = await api.put(`/documents/${docId}/fields/${fieldId}`, { field_value: fieldValue });
  return res.data;
};

export const postDocumentChat = async (docId, message) => {
  const res = await api.post(`/documents/${docId}/chat`, { message });
  return res.data;
};

export const getAnalytics = async () => {
  const res = await api.get('/analytics');
  return res.data;
};

export const getAlerts = async (status = 'all') => {
  const res = await api.get('/alerts', { params: { status } });
  return res.data;
};

export const markAlertRead = async (id) => {
  const res = await api.put(`/alerts/${id}/read`);
  return res.data;
};

export const resolveAlert = async (id) => {
  const res = await api.put(`/alerts/${id}/resolve`);
  return res.data;
};

export const syncToGoogleSheets = async (docId, webhookUrl = '') => {
  const res = await api.post(`/documents/${docId}/sync-sheets`, { webhook_url: webhookUrl });
  return res.data;
};

export const syncAllToGoogleSheets = async (webhookUrl = '') => {
  const res = await api.post('/documents/sync-all-sheets', { webhook_url: webhookUrl });
  return res.data;
};

export const saveWebhookUrl = async (webhookUrl = '') => {
  const res = await api.post('/documents/save-webhook-url', { webhook_url: webhookUrl });
  return res.data;
};

export const getGoogleScriptCode = async () => {
  const res = await api.get('/documents/google-script-code');
  return res.data;
};

export const exportDocumentUrl = (id, format) => {
  return `${API_BASE}/documents/${id}/export?format=${format}`;
};

export default api;
