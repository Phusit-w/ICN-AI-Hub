import { useRef } from 'react'
import { FileText, Plus, X } from 'lucide-react'
import { uid } from '../../lib/utils'

const fileSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

/** Round ＋ button that opens the file picker; hands back plain {id, name, size} records. */
export function AttachButton({ onAdd }) {
  const input = useRef(null)
  return (
    <>
      <input
        ref={input} type="file" multiple hidden
        onChange={(e) => {
          onAdd([...e.target.files].map((f) => ({ id: uid('file'), name: f.name, size: f.size })))
          e.target.value = '' // allow picking the same file again after removing it
        }}
      />
      <button type="button" aria-label="แนบไฟล์" title="แนบไฟล์" onClick={() => input.current?.click()} className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
        <Plus className="size-5" aria-hidden />
      </button>
    </>
  )
}

/** Chips for attached files; pass `onRemove` to make them removable. */
export function AttachmentList({ files, onRemove, className }) {
  if (!files?.length) return null
  return (
    <ul className={className ?? 'flex flex-wrap gap-1.5 px-2 pt-1 pb-2'} aria-label="ไฟล์ที่แนบ">
      {files.map((f) => (
        <li key={f.id} className="rise flex max-w-60 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-1 pr-1.5 pl-2 text-xs">
          <FileText className="size-4 shrink-0 text-brand-500" aria-hidden />
          <span className="min-w-0">
            <span className="block truncate font-medium text-slate-700">{f.name}</span>
            <span className="block text-[10px] text-slate-400">{fileSize(f.size)}</span>
          </span>
          {onRemove && (
            <button type="button" onClick={() => onRemove(f.id)} aria-label={`ลบไฟล์ ${f.name}`} className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700">
              <X className="size-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
