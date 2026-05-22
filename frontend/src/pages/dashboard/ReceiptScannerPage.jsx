import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { UploadZone } from '../../components/forms/UploadZone'
import { SparklesIcon } from '../../components/ui/Icons'
import { uploadReceipt } from '../../services/dashboard'

export function ReceiptScannerPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const extracted = useMemo(() => result?.receipt || null, [result])

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelect = (nextFile) => {
    setError('')
    setResult(null)
    setFile(nextFile)
    const nextPreview = URL.createObjectURL(nextFile)
    setPreviewUrl(nextPreview)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Select a receipt image first.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const response = await uploadReceipt(file)
      setResult(response)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to process the receipt.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Card className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Receipts</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text">Receipt scanner</h1>
          <p className="mt-2 text-sm text-muted">Upload a receipt image and let OCR plus Gemini extract the transaction details.</p>
        </div>
        <div className="hidden rounded-3xl bg-accentSoft px-4 py-3 text-accent md:flex md:items-center md:gap-2">
          <SparklesIcon className="h-4 w-4" /> AI extraction
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <UploadZone onFileSelect={handleFileSelect} previewUrl={previewUrl} loading={uploading} />
          <Button className="w-full" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Processing receipt...' : 'Save transaction from receipt'}
          </Button>
          {error ? <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div> : null}
        </div>

        <Card>
          <h3 className="font-display text-lg font-bold text-text">Extracted data preview</h3>
          <p className="mt-1 text-sm text-muted">The receipt is automatically saved to your transaction ledger after processing.</p>

          {!result ? (
            <div className="mt-6">
              <EmptyState title="No receipt processed yet" message="Upload a receipt to preview merchant, amount, date, and category extraction." />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <Card className="bg-surfaceAlt">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs uppercase tracking-[0.22em] text-muted">Merchant</p><p className="mt-2 font-semibold text-text">{extracted?.merchant}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.22em] text-muted">Amount</p><p className="mt-2 font-semibold text-text">₹{extracted?.amount}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.22em] text-muted">Date</p><p className="mt-2 font-semibold text-text">{extracted?.date}</p></div>
                  <div><p className="text-xs uppercase tracking-[0.22em] text-muted">Category</p><p className="mt-2 font-semibold text-text">{extracted?.category}</p></div>
                </div>
              </Card>
              <Card className="bg-surfaceAlt">
                <p className="text-xs uppercase tracking-[0.22em] text-muted">Saved transaction</p>
                <div className="mt-3 grid gap-2 text-sm text-muted">
                  <p>Transaction ID: <span className="font-semibold text-text">{extracted?.transaction_id}</span></p>
                  <p>OCR confidence: <span className="font-semibold text-text">{extracted?.ocr_confidence}%</span></p>
                  <p className="leading-6">You can now find this transaction in the dashboard and analytics views.</p>
                </div>
              </Card>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  )
}