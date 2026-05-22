import api from './api'

function extractData(response) {
  return response.data?.data || {}
}

export async function getDashboardSummary() {
  const response = await api.get('/api/dashboard/summary')
  return extractData(response).summary || {}
}

export async function getDashboardTrend() {
  const response = await api.get('/api/dashboard/trend')
  return extractData(response).items || []
}

export async function getMonthlyAnalytics(month) {
  const response = await api.get('/api/analytics/monthly', { params: { month } })
  return extractData(response).analytics || {}
}

export async function getTransactions(limit = 20) {
  const response = await api.get('/api/transactions', { params: { limit } })
  return extractData(response).items || []
}

export async function createTransaction(payload) {
  const response = await api.post('/api/transactions', payload)
  return extractData(response)
}

export async function uploadReceipt(file, onUploadProgress) {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/api/receipts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
  return extractData(response)
}

export async function getAiInsights() {
  const response = await api.get('/api/ai/insights')
  const insight = extractData(response).insights || {}
  if (Array.isArray(insight)) {
    return insight
  }

  const cards = []
  if (insight.summary_text) {
    cards.push(insight.summary_text)
  }

  try {
    const parsed = typeof insight.insights_text === 'string' ? JSON.parse(insight.insights_text) : null
    if (parsed && Array.isArray(parsed.highlights)) {
      cards.push(...parsed.highlights)
    }
    if (parsed && Array.isArray(parsed.recommendations)) {
      cards.push(...parsed.recommendations)
    }
  } catch (_error) {
    if (insight.insights_text) {
      cards.push(insight.insights_text)
    }
  }

  return cards
}