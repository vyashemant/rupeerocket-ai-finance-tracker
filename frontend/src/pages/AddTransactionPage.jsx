import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { ErrorState } from '../components/ui/ErrorState'

const today = new Date().toISOString().slice(0, 10)

export function AddTransactionPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category_id: '',
    date: today,
    notes: '',
  })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/categories')
      setCategories(response.data.data.items)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/api/transactions', {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
      })
      setSuccess('Transaction added successfully.')
      setForm({ title: '', amount: '', type: 'expense', category_id: '', date: today, notes: '' })
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to save this transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-border bg-surface px-6 py-12 text-sm text-muted">Loading categories...</div>
  }

  return (
    <Card className="max-w-3xl">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-muted">Transactions</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-text">Add a transaction</h1>
        <p className="mt-2 text-sm text-muted">Record income and expenses with categorized tracking.</p>
      </div>

      {error ? <ErrorState title="Could not save transaction" message={error} /> : null}
      {success ? <div className="mt-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">{success}</div> : null}

      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <Input label="Title" name="title" value={form.title} onChange={handleChange} required />
        <Input label="Amount" name="amount" type="number" step="0.01" min="0" value={form.amount} onChange={handleChange} required />
        <Select label="Type" name="type" value={form.type} onChange={handleChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Select label="Category" name="category_id" value={form.category_id} onChange={handleChange}>
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </Select>
        <Input label="Date" name="date" type="date" value={form.date} onChange={handleChange} required />
        <div />
        <Textarea className="md:col-span-2" label="Notes" name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes about this transaction" />
        <div className="md:col-span-2 flex gap-3">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save transaction'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
        </div>
      </form>
    </Card>
  )
}