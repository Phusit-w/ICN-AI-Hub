import { CircleCheck, CircleDashed, Cloud, LoaderCircle, Server, Star, Undo2, Lock, Users, Building2, Shuffle } from 'lucide-react'
import { deptById, modelById } from '../../data/catalog'
import { cn } from '../../lib/utils'

const TONES = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-50 text-rose-700',
  outline: 'border border-slate-200 text-slate-600 bg-white',
}

export default function Badge({ tone = 'neutral', icon: Icon, className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11.5px] font-medium whitespace-nowrap', TONES[tone], className)}>
      {Icon && <Icon className="size-3" aria-hidden />}
      {children}
    </span>
  )
}

export const STATUS = {
  waiting: { label: 'Waiting', th: 'รอคิว', tone: 'neutral', icon: CircleDashed },
  processing: { label: 'Processing', th: 'กำลังทำ', tone: 'brand', icon: LoaderCircle },
  completed: { label: 'Completed', th: 'เสร็จแล้ว', tone: 'success', icon: CircleCheck },
  returned: { label: 'Sent back', th: 'ส่งกลับแก้', tone: 'warning', icon: Undo2 },
  planned: { label: 'Ready to run', th: 'รอเริ่ม', tone: 'outline', icon: CircleDashed },
  running: { label: 'Running', th: 'กำลังทำงาน', tone: 'brand', icon: LoaderCircle },
}

export function StatusPill({ status, className }) {
  const s = STATUS[status] ?? STATUS.waiting
  const spinning = status === 'processing' || status === 'running'
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium whitespace-nowrap', TONES[s.tone], className)}>
      <s.icon className={cn('size-3', spinning && 'animate-spin')} aria-hidden />
      {s.th}
    </span>
  )
}

/** Where the model runs — the core "provider-agnostic" signal shown everywhere a model appears. */
export function ModelBadge({ modelId, showName = true }) {
  const m = modelById(modelId)
  const map = {
    local: { icon: Server, tone: 'success', text: 'Local' },
    cloud: { icon: Cloud, tone: 'neutral', text: 'Cloud' },
    auto: { icon: Shuffle, tone: 'brand', text: 'Auto' },
  }[m.location]
  return (
    <Badge tone={map.tone} icon={map.icon}>
      {showName ? `${m.name} · ${map.text}` : map.text}
    </Badge>
  )
}

export function DeptBadge({ dept }) {
  const d = deptById(dept)
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
      <span className={cn('size-1.5 rounded-full', d.dot)} aria-hidden />
      {d.name}
    </span>
  )
}

const SHARE_ICONS = { private: Lock, department: Users, company: Building2 }
const SHARE_LABEL = { private: 'เฉพาะฉัน', department: 'ในแผนก', company: 'ทั้งบริษัท' }
export function ShareBadge({ share }) {
  return <Badge tone="outline" icon={SHARE_ICONS[share]}>{SHARE_LABEL[share]}</Badge>
}

export function Rating({ value }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
      {value.toFixed(1)}
    </span>
  )
}
