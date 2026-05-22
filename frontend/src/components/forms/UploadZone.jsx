import { useRef } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { UploadIcon } from '../ui/Icons'

export function UploadZone({ onFileSelect, previewUrl, loading, helperText = 'Upload a JPG, JPEG, or PNG receipt image.' }) {
  const inputRef = useRef(null)

  const openPicker = () => {
    inputRef.current?.click()
  }

  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <Card>
      <div className="flex flex-col items-center gap-4 rounded-[28px] border border-dashed border-border bg-surfaceAlt/70 p-8 text-center">
        {previewUrl ? (
          <img src={previewUrl} alt="Receipt preview" className="max-h-64 rounded-3xl border border-border object-contain shadow-soft" />
        ) : (
          <div className="rounded-full bg-accentSoft p-5 text-accent">
            <UploadIcon className="h-7 w-7" />
          </div>
        )}
        <div>
          <h3 className="font-display text-xl font-bold text-text">Scan a receipt</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{helperText}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={openPicker} disabled={loading}>{loading ? 'Processing...' : 'Choose file'}</Button>
          {previewUrl ? <span className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">Image loaded</span> : null}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handleChange} />
      </div>
    </Card>
  )
}