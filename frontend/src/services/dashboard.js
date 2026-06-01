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

export async function getAiInsights(month, options = {}) {
  const params = {
    _t: Date.now(),
    ...(month ? { month } : {}),
    ...(options.force ? { force: 'true' } : {}),
  }
  const response = await api.get('/api/ai/insights', { params })
  const insight = extractData(response).insights || {}
  if (Array.isArray(insight)) {
    return insight
  }

  let parsed = null
  if (typeof insight.insights_text === 'string') {
    try {
      parsed = JSON.parse(insight.insights_text)
    } catch (_error) {
      parsed = null
    }
  }

  const summary = typeof insight.summary_text === 'string' && insight.summary_text.trim()
    ? insight.summary_text.trim()
    : typeof parsed?.summary === 'string' && parsed.summary.trim()
      ? parsed.summary.trim()
      : 'No AI insights available.'

  const highlights = Array.isArray(parsed?.highlights) ? parsed.highlights.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : []
  const recommendations = Array.isArray(parsed?.recommendations) ? parsed.recommendations.filter(Boolean).map((item) => String(item).trim()).filter(Boolean) : []

  const cards = [
    {
      title: 'AI summary',
      message: summary,
      badge: 'Summary',
    },
  ]

  highlights.slice(0, 2).forEach((message, index) => {
    cards.push({
      title: index === 0 ? 'Top highlight' : 'Insight',
      message,
      badge: 'Highlight',
    })
  })

  recommendations.slice(0, 2).forEach((message, index) => {
    cards.push({
      title: index === 0 ? 'Next action' : 'Recommendation',
      message,
      badge: 'Action',
    })
  })

  return cards
}
