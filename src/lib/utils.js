export const cn = (...classes) => classes.filter(Boolean).join(' ')

export const uid = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const fmt = (n) => n.toLocaleString('en-US')

export const fmtCompact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n))

export const fmtBaht = (n) => `฿${n.toLocaleString('en-US')}`

export function timeAgo(ts) {
  const min = Math.round((Date.now() - ts) / 60000)
  if (min < 1) return 'เมื่อสักครู่'
  if (min < 60) return `${min} นาทีที่แล้ว`
  const h = Math.round(min / 60)
  if (h < 24) return `${h} ชม.ที่แล้ว`
  return `${Math.round(h / 24)} วันที่แล้ว`
}

export const clockTime = (ts) => new Date(ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
