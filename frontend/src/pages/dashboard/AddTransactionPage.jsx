import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { createTransaction } from '../../services/dashboard'
import api from '../../services/api'

const today = new Date().toISOString().slice(0, 10)

export function AddTransactionPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    defaultValues: { title: '', amount: '', type: 'expense', category_id: '', date: today, notes: '' },
  })

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await api.get('/api/categories')
        setCategories(response.data.data.items || [])
      } catch (error) {
        setSubmitError(error?.response?.data?.message || 'Unable to load categories.')
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  const onSubmit = async (values) => {
    setSubmitError('')
    try {
      await createTransaction({
        ...values,
        category_id: values.category_id ? Number(values.category_id) : null,
      })
      reset({ title: '', amount: '', type: 'expense', category_id: '', date: today, notes: '' })
      navigate('/dashboard')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to save this transaction.')
    }
  }

  if (loadingCategories) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading categories" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
      <Card className="p-6 sm:p-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Transactions</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">Add a transaction</h1>
          <p className="mt-2 text-sm text-muted">Record income and expenses with clean categorization.</p>
        </div>

        {submitError ? <div className="mt-5 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{submitError}</div> : null}

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Input label="Amount" type="number" step="0.01" min="0" error={errors.amount?.message} {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Amount must be greater than zero' } })} />
          <Select label="Type" error={errors.type?.message} {...register('type', { required: 'Type is required' })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Select label="Category" {...register('category_id')}>
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Select>
          <Input label="Date" type="date" error={errors.date?.message} {...register('date', { required: 'Date is required' })} />
          <div />
          <Textarea className="md:col-span-2" label="Notes" placeholder="Optional notes about this transaction" {...register('notes')} />
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save transaction'}</Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}