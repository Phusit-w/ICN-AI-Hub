import { CircleAlert, CircleCheck } from 'lucide-react'
import logo from '../../assets/icn-logo.png'

/** The company name on the letterhead, as on ICN's organization chart. */
const COMPANY_NAME = 'Information and Communication Networks Public Company Limited'

function Diagram({ nodes }) {
  const w = 150, gap = 40, h = 56
  const total = nodes.length * w + (nodes.length - 1) * gap
  return (
    <svg viewBox={`0 0 ${total + 20} ${h + 60}`} className="w-full rounded-lg bg-slate-50" role="img" aria-label={nodes.join(' → ')}>
      {nodes.map((n, i) => {
        const x = 10 + i * (w + gap)
        return (
          <g key={n}>
            <rect x={x} y={30} width={w} height={h} rx={10} className={i === 1 ? 'fill-brand-600' : 'fill-white stroke-slate-300'} strokeWidth={1.5} />
            <text x={x + w / 2} y={30 + h / 2 + 4} textAnchor="middle" className={i === 1 ? 'fill-white' : 'fill-slate-700'} style={{ font: '600 12px Inter, sans-serif' }}>{n}</text>
            {i < nodes.length - 1 && (
              <path d={`M${x + w + 4} ${30 + h / 2} H${x + w + gap - 6}`} className="stroke-slate-400" strokeWidth={1.5} markerEnd="url(#arrow)" />
            )}
          </g>
        )
      })}
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" className="fill-slate-400" />
        </marker>
      </defs>
    </svg>
  )
}

/** Renders a mock agent output according to its type. */
export default function ArtifactView({ artifact }) {
  switch (artifact.type) {
    case 'text':
      return <p className="text-[15px] leading-relaxed whitespace-pre-line text-slate-700">{artifact.text}</p>
    case 'bullets':
      return (
        <ul className="space-y-2">
          {artifact.items.map((it) => (
            <li key={it.text} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden />
              <span>{it.text}{it.source && <span className="ml-1.5 text-xs text-slate-400">[{it.source}]</span>}</span>
            </li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>{artifact.columns.map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {artifact.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className="px-3 py-2 text-slate-700">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
      )
    case 'doc':
      // Only documents carry the letterhead, as a real one would; tables, images and chat answers don't.
      return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
          <header aria-label="หัวจดหมาย ICN" className="flex items-center gap-3 border-b-4 border-brand-600 bg-slate-50 px-6 py-3">
            <img src={logo} alt="ICN" className="h-9 w-auto rounded" />
            <p className="min-w-0 flex-1 text-xs leading-snug font-semibold text-slate-800">{COMPANY_NAME}</p>
            <span className="hidden text-[11px] text-slate-400 sm:inline">Template: {artifact.template}</span>
          </header>
          <div className="space-y-4 px-6 py-5">
            {artifact.sections.map((s) => (
              <section key={s.heading}>
                <h4 className="text-sm font-semibold text-slate-900">{s.heading}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.body}</p>
              </section>
            ))}
          </div>
        </div>
      )
    case 'diagram':
      return <Diagram nodes={artifact.nodes} />
    case 'checklist':
      return (
        <ul className="space-y-2">
          {artifact.items.map((it) => (
            <li key={it.text} className="flex items-center gap-2 text-sm text-slate-700">
              {it.ok ? <CircleCheck className="size-4 text-emerald-500" aria-label="ผ่าน" /> : <CircleAlert className="size-4 text-amber-500" aria-label="ไม่ผ่าน" />}
              {it.text}
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}
