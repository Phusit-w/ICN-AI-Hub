import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CircleCheck, ExternalLink, GitBranch, Minus, MousePointerClick, Play, Plus, Save, Trash2, Undo2 } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { DEPARTMENTS } from '../data/catalog'
import { cn, uid } from '../lib/utils'
import { Card, PageHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { ModelBadge, StatusPill } from '../components/ui/Badge'
import { Field, Input, Segmented, Select, Textarea } from '../components/ui/Form'
import EntityIcon from '../components/agents/EntityIcon'

const W = 200
const H = 76
const DRAG_TYPE = 'application/x-icn-node'

const blankWorkflow = () => ({
  id: uid('wf'), name: 'Untitled workflow', dept: 'sales', description: '', owner: 'u-kanya', uses: 0, rating: 0, version: '0.1',
  nodes: [
    { id: 'n1', type: 'trigger', label: 'ผู้ใช้ส่งคำขอ', x: 40, y: 60 },
    { id: 'n-out', type: 'output', label: 'ส่งผลลัพธ์', x: 700, y: 60 },
  ],
  edges: [],
})

function useNodeMeta() {
  const { state } = useStore()
  return useCallback((n) => {
    if (n.type === 'agent') {
      const a = state.agents.find((x) => x.id === n.ref)
      return { title: a?.name ?? 'Missing agent', sub: 'Agent', icon: a?.kind ?? 'agent', tone: 'agent', model: a?.model }
    }
    if (n.type === 'skill') {
      const s = state.skills.find((x) => x.id === n.ref)
      return { title: s?.name ?? 'Missing skill', sub: 'Skill', icon: s?.icon ?? 'skill', tone: 'skill' }
    }
    return { title: n.label, sub: { trigger: 'Trigger', condition: 'Condition', output: 'Output' }[n.type], icon: n.type, tone: 'skill' }
  }, [state.agents, state.skills])
}

function edgePath(a, b, loop) {
  if (loop) {
    const sx = a.x + W / 2, sy = a.y + H, tx = b.x + W / 2, ty = b.y + H
    const dip = Math.max(sy, ty) + 90
    return { d: `M${sx} ${sy} C${sx} ${dip}, ${tx} ${dip}, ${tx} ${ty + 6}`, mx: (sx + tx) / 2, my: dip - 22 }
  }
  const sx = a.x + W, sy = a.y + H / 2, tx = b.x, ty = b.y + H / 2
  const c = Math.max(40, Math.abs(tx - sx) / 2)
  return { d: `M${sx} ${sy} C${sx + c} ${sy}, ${tx - c} ${ty}, ${tx - 6} ${ty}`, mx: (sx + tx) / 2, my: (sy + ty) / 2 - 10 }
}

function Palette({ onAdd }) {
  const { state } = useStore()
  const [tab, setTab] = useState('agents')
  const items = {
    agents: state.agents.map((a) => ({ key: a.id, type: 'agent', ref: a.id, title: a.name, icon: a.kind, tone: 'agent' })),
    skills: state.skills.map((s) => ({ key: s.id, type: 'skill', ref: s.id, title: s.name, icon: s.icon, tone: 'skill' })),
    logic: [
      { key: 'condition', type: 'condition', label: 'ตรวจเงื่อนไข', title: 'Condition', icon: 'condition', tone: 'skill', hint: 'ถ้าไม่ผ่าน ส่งงานกลับไปขั้นก่อนหน้า' },
      { key: 'output', type: 'output', label: 'ส่งผลลัพธ์', title: 'Output', icon: 'output', tone: 'skill', hint: 'จุดสิ้นสุดของ Workflow' },
    ],
  }[tab]
  return (
    <Card data-tour="wf-palette" className="flex max-h-[640px] flex-col">
      <div className="border-b border-slate-100 p-3">
        <p className="mb-2 text-xs text-slate-500">ลากไปวางบน Canvas หรือคลิกเพื่อเพิ่ม</p>
        <Segmented value={tab} onChange={setTab} className="w-full" options={[{ value: 'agents', label: 'Agents' }, { value: 'skills', label: 'Skills' }, { value: 'logic', label: 'Logic' }]} />
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((it) => (
          <li key={it.key}>
            <button
              type="button" draggable onClick={() => onAdd(it)}
              onDragStart={(e) => { e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(it)); e.dataTransfer.effectAllowed = 'copy' }}
              className="flex w-full cursor-grab items-center gap-2.5 rounded-lg border border-transparent px-2 py-1.5 text-left hover:border-slate-200 hover:bg-slate-50 active:cursor-grabbing"
            >
              <EntityIcon icon={it.icon} size="sm" tone={it.tone} />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-slate-700">{it.title}</span>
                {it.hint && <span className="block truncate text-[11px] text-slate-400">{it.hint}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function WorkflowBuilder() {
  const { state, actions } = useStore()
  const [params, setParams] = useSearchParams()
  const meta = useNodeMeta()
  const source = state.workflows.find((w) => w.id === params.get('id')) ?? state.workflows[0]
  const [draft, setDraft] = useState(() => structuredClone(source))
  const [selected, setSelected] = useState(null) // { kind: 'node' | 'edge', id }
  const [connecting, setConnecting] = useState(null)
  const [zoom, setZoom] = useState(0.85)
  const [testInput, setTestInput] = useState('ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Thai Retail Group')
  const [runId, setRunId] = useState(null)
  const surface = useRef(null)
  const drag = useRef(null)

  useEffect(() => {
    if (source && source.id !== draft.id && params.get('id')) { setDraft(structuredClone(source)); setSelected(null); setRunId(null) }
  }, [source, draft.id, params])

  const run = state.runs.find((r) => r.id === runId)
  const stepOf = (nodeId) => run?.steps.find((s) => s.nodeId === nodeId)
  const nodeById = (id) => draft.nodes.find((n) => n.id === id)
  const dirty = JSON.stringify(draft) !== JSON.stringify(state.workflows.find((w) => w.id === draft.id))

  const update = (fn) => setDraft((d) => fn(structuredClone(d)))
  const addNode = (item, pos) => {
    const maxX = Math.max(...draft.nodes.map((n) => n.x), 0)
    const node = { id: uid('n'), type: item.type, ref: item.ref, label: item.label, x: pos?.x ?? maxX + 250, y: pos?.y ?? 60 }
    update((d) => { d.nodes.push(node); return d })
    setSelected({ kind: 'node', id: node.id })
  }
  // The trigger is the workflow's entry point, so it can't be deleted.
  const removeSelected = useCallback(() => {
    if (!selected) return
    setDraft((d) => {
      if (selected.kind === 'edge') return { ...d, edges: d.edges.filter((e) => e.id !== selected.id) }
      if (d.nodes.find((n) => n.id === selected.id)?.type === 'trigger') return d
      return { ...d, nodes: d.nodes.filter((n) => n.id !== selected.id), edges: d.edges.filter((e) => e.from !== selected.id && e.to !== selected.id) }
    })
    setSelected(null)
  }, [selected])

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      if (e.key === 'Escape') setConnecting(null)
      if (e.key === 'Delete' || e.key === 'Backspace') removeSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [removeSelected])

  const connectTo = (targetId) => {
    if (!connecting || connecting === targetId) return setConnecting(null)
    const from = nodeById(connecting), to = nodeById(targetId)
    if (!draft.edges.some((e) => e.from === from.id && e.to === to.id)) {
      // A condition pointing back to an earlier node is a retry loop.
      const loop = from.type === 'condition' && to.x < from.x
      const hasForward = draft.edges.some((e) => e.from === from.id && e.kind !== 'loop')
      const label = from.type === 'condition' ? (loop ? 'ไม่ผ่าน → ทำใหม่' : hasForward ? 'ไม่ผ่าน' : 'ผ่าน') : undefined
      update((d) => { d.edges.push({ id: uid('e'), from: from.id, to: to.id, kind: loop ? 'loop' : undefined, label }); return d })
    }
    setConnecting(null)
  }

  const onPointerDown = (e, node) => {
    if (e.button !== 0 || e.target.closest('[data-port]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: node.id, sx: e.clientX, sy: e.clientY, ox: node.x, oy: node.y, moved: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = (e.clientX - d.sx) / zoom, dy = (e.clientY - d.sy) / zoom
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true
    setDraft((w) => ({ ...w, nodes: w.nodes.map((n) => (n.id === d.id ? { ...n, x: Math.max(0, Math.round(d.ox + dx)), y: Math.max(0, Math.round(d.oy + dy)) } : n)) }))
  }
  const onPointerUp = (node) => {
    const d = drag.current
    drag.current = null
    if (d && !d.moved) {
      if (connecting) connectTo(node.id)
      else setSelected({ kind: 'node', id: node.id })
    }
  }

  const onDrop = (e) => {
    const raw = e.dataTransfer.getData(DRAG_TYPE)
    if (!raw) return
    e.preventDefault()
    const rect = surface.current.getBoundingClientRect()
    addNode(JSON.parse(raw), { x: Math.max(0, Math.round((e.clientX - rect.left) / zoom - W / 2)), y: Math.max(0, Math.round((e.clientY - rect.top) / zoom - H / 2)) })
  }

  const save = () => { actions.saveWorkflow(draft); actions.toast(`บันทึก “${draft.name}” แล้ว`) }
  const testRun = () => {
    const id = actions.planRun(testInput || `ทดสอบ ${draft.name}`, { workflowId: draft.id }, { ...state, workflows: [draft] })
    actions.startRun(id)
    setRunId(id)
    setSelected(null)
  }
  const switchTo = (id) => {
    if (id === 'new') { const wf = blankWorkflow(); setDraft(wf); setParams({}); setSelected(null); setRunId(null); return }
    setParams({ id })
  }

  const width = Math.max(...draft.nodes.map((n) => n.x)) + W + 120
  const height = Math.max(...draft.nodes.map((n) => n.y)) + H + 180
  const sel = selected?.kind === 'node' ? nodeById(selected.id) : null
  const selEdge = selected?.kind === 'edge' ? draft.edges.find((e) => e.id === selected.id) : null

  return (
    <div>
      <PageHeader
        eyebrow="งานของฉัน" title="แก้สายงาน (Workflow)"
        subtitle="ต่อ Agent และ Skill ให้ทำงานต่อกันเป็นสาย กำหนดเงื่อนไขให้ส่งงานกลับได้เมื่อข้อมูลไม่ครบ"
        actions={
          <>
            <Select value={params.get('id') ? draft.id : state.workflows.some((w) => w.id === draft.id) ? draft.id : 'new'} onChange={(e) => switchTo(e.target.value)} className="w-auto max-w-64" aria-label="เลือก Workflow">
              {state.workflows.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              <option value="new">+ New workflow</option>
            </Select>
            <Button icon={Save} onClick={save} disabled={!dirty}>{dirty ? 'บันทึก' : 'บันทึกแล้ว'}</Button>
            <Button variant="primary" icon={Play} data-tour="wf-test" onClick={testRun} disabled={run?.status === "running"}>ทดลองรัน</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)] 2xl:grid-cols-[240px_minmax(0,1fr)_300px]">
        <Palette onAdd={addNode} />

        <Card data-tour="wf-canvas" className="relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
            <Input value={draft.name} onChange={(e) => update((d) => ({ ...d, name: e.target.value }))} className="h-8 max-w-xs border-transparent font-medium shadow-none hover:border-slate-200" aria-label="ชื่อ Workflow" />
            {connecting && (
              <span className="rise flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                <MousePointerClick className="size-3.5" /> คลิก Node ปลายทาง (Esc เพื่อยกเลิก)
              </span>
            )}
            <div className="ml-auto flex items-center gap-1">
              <Button size="icon" variant="ghost" icon={Minus} onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="ซูมออก" />
              <span className="w-10 text-center text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
              <Button size="icon" variant="ghost" icon={Plus} onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} aria-label="ซูมเข้า" />
            </div>
          </div>
          <div className="canvas-grid h-[560px] overflow-auto bg-slate-50/50" onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={(e) => { if (e.target === e.currentTarget || e.target === surface.current) { setSelected(null); setConnecting(null) } }}>
            <div style={{ width: width * zoom, height: height * zoom }}>
              <div ref={surface} className="relative origin-top-left" style={{ width, height, transform: `scale(${zoom})` }}>
                <svg className="pointer-events-none absolute inset-0 overflow-visible" width={width} height={height}>
                  <defs>
                    {['slate', 'brand', 'amber'].map((c) => (
                      <marker key={c} id={`arr-${c}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                        <path d="M0 0 L10 5 L0 10 z" className={{ slate: 'fill-slate-400', brand: 'fill-brand-500', amber: 'fill-amber-500' }[c]} />
                      </marker>
                    ))}
                  </defs>
                  {draft.edges.map((e) => {
                    const a = nodeById(e.from), b = nodeById(e.to)
                    if (!a || !b) return null
                    const loop = e.kind === 'loop'
                    const { d, mx, my } = edgePath(a, b, loop)
                    const active = stepOf(a.id)?.status === 'completed' && stepOf(b.id)?.status === 'processing'
                    const isSel = selected?.id === e.id
                    const color = loop ? 'amber' : active || isSel ? 'brand' : 'slate'
                    return (
                      <g key={e.id} className="pointer-events-auto cursor-pointer" onClick={(ev) => { ev.stopPropagation(); setSelected({ kind: 'edge', id: e.id }) }}>
                        <path d={d} fill="none" stroke="transparent" strokeWidth="14" />
                        <path
                          d={d} fill="none" strokeWidth={isSel ? 2.5 : 1.75} markerEnd={`url(#arr-${color})`}
                          className={cn(loop ? 'stroke-amber-500' : active || isSel ? 'stroke-brand-500' : 'stroke-slate-400', (loop || active) && 'flow-line')}
                        />
                        {e.label && (
                          <foreignObject x={mx - 70} y={my - 11} width="140" height="22" className="overflow-visible">
                            <div className={cn('mx-auto w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap', loop ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600')}>{e.label}</div>
                          </foreignObject>
                        )}
                      </g>
                    )
                  })}
                </svg>

                {draft.nodes.map((n) => {
                  const m = meta(n)
                  const step = stepOf(n.id)
                  const status = step?.status
                  const isSel = selected?.id === n.id
                  return (
                    <div
                      key={n.id} role="button" tabIndex={0} aria-label={m.title}
                      onPointerDown={(e) => onPointerDown(e, n)} onPointerMove={onPointerMove} onPointerUp={() => onPointerUp(n)}
                      onKeyDown={(e) => e.key === 'Enter' && (connecting ? connectTo(n.id) : setSelected({ kind: 'node', id: n.id }))}
                      className={cn(
                        'absolute flex cursor-grab touch-none items-center gap-2.5 rounded-xl border px-3 shadow-sm select-none active:cursor-grabbing',
                        n.type === 'condition' && 'border-dashed',
                        // Exactly one border/background pair so Tailwind's CSS order can't pick the wrong one.
                        {
                          processing: 'pulse-ring border-brand-500 bg-white',
                          completed: 'border-emerald-400 bg-white',
                          returned: 'border-amber-500 bg-amber-50',
                        }[status] ?? {
                          trigger: 'border-slate-800 bg-slate-900 text-white',
                          condition: 'border-amber-400 bg-amber-50',
                          output: 'border-emerald-300 bg-emerald-50',
                        }[n.type] ?? 'border-slate-200 bg-white',
                        isSel && 'ring-2 ring-brand-500 ring-offset-2',
                        connecting && connecting !== n.id && 'ring-2 ring-brand-200 hover:ring-brand-500',
                      )}
                      style={{ left: n.x, top: n.y, width: W, height: H }}
                    >
                      {n.type !== 'trigger' && <span className="absolute top-1/2 -left-1.5 size-3 -translate-y-1/2 rounded-full border-2 border-white bg-slate-300" aria-hidden />}
                      <EntityIcon icon={m.icon} size="sm" tone={m.tone} className={n.type === 'trigger' ? '!bg-white/10 !text-white !ring-white/20' : undefined} />
                      <div className="min-w-0 flex-1">
                        <div className={cn('truncate text-[13px] font-semibold', n.type === 'trigger' ? 'text-white' : 'text-slate-800')}>{m.title}</div>
                        <div className="mt-1 flex items-center gap-1">
                          {status ? <StatusPill status={status} /> : m.model ? <ModelBadge modelId={m.model} showName={false} /> : <span className={cn('text-[11px]', n.type === 'trigger' ? 'text-slate-400' : 'text-slate-500')}>{m.sub}</span>}
                        </div>
                      </div>
                      {n.type !== 'output' && (
                        <button
                          type="button" data-port aria-label={`เชื่อมจาก ${m.title}`} title="คลิกเพื่อเชื่อมไปยัง Node อื่น"
                          onClick={(e) => { e.stopPropagation(); setConnecting(connecting === n.id ? null : n.id) }}
                          className={cn('absolute top-1/2 -right-2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white transition hover:scale-125', connecting === n.id ? 'bg-brand-600' : 'bg-brand-400')}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">
            <span>ลาก Node เพื่อย้าย · คลิกจุด <span className="inline-block size-2 rounded-full bg-brand-400 align-middle" /> เพื่อเชื่อม · Delete เพื่อลบ</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-0 w-5 border-t-2 border-dashed border-amber-500" /> เส้นวนกลับเมื่อเงื่อนไขไม่ผ่าน</span>
          </div>
        </Card>

        <Card className="p-4 xl:col-span-2 2xl:col-span-1">
          {sel ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <EntityIcon icon={meta(sel).icon} tone={meta(sel).tone} />
                <div className="min-w-0"><p className="text-xs text-slate-500">{meta(sel).sub}</p><p className="truncate text-sm font-semibold text-slate-900">{meta(sel).title}</p></div>
              </div>
              {sel.type === 'agent' && (
                <>
                  <Field label="Agent">
                    <Select value={sel.ref} onChange={(e) => update((d) => { d.nodes.find((n) => n.id === sel.id).ref = e.target.value; return d })}>
                      {state.agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </Select>
                  </Field>
                  <p className="text-xs leading-relaxed text-slate-500">{state.agents.find((a) => a.id === sel.ref)?.description}</p>
                  <Link to={`/agents/${sel.ref}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">ดูรายละเอียด Agent <ExternalLink className="size-3" /></Link>
                </>
              )}
              {sel.type === 'skill' && (
                <Field label="Skill">
                  <Select value={sel.ref} onChange={(e) => update((d) => { d.nodes.find((n) => n.id === sel.id).ref = e.target.value; return d })}>
                    {state.skills.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </Select>
                </Field>
              )}
              {['trigger', 'condition', 'output'].includes(sel.type) && (
                <Field label={sel.type === 'condition' ? 'เงื่อนไข (คำถามที่ต้องตอบ ใช่/ไม่ใช่)' : 'ชื่อ'}>
                  <Input value={sel.label} onChange={(e) => update((d) => { d.nodes.find((n) => n.id === sel.id).label = e.target.value; return d })} />
                </Field>
              )}
              {sel.type === 'condition' && (
                <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
                  <GitBranch className="mt-0.5 size-3.5 shrink-0" />
                  เชื่อมจาก Condition ไปยัง Node ที่อยู่ก่อนหน้า ระบบจะสร้างเส้นวนกลับให้อัตโนมัติ เช่น “ข้อมูลไม่ครบ → กลับไป Research Agent”
                </p>
              )}
              <div className="flex gap-2 border-t border-slate-100 pt-4">
                <Button size="sm" variant="subtle" onClick={() => setConnecting(sel.id)} disabled={sel.type === 'output'}>เชื่อมต่อไปยัง…</Button>
                {sel.type !== 'trigger' && <Button size="sm" variant="danger" icon={Trash2} onClick={removeSelected}>ลบ</Button>}
              </div>
            </div>
          ) : selEdge ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900">เส้นเชื่อม</p>
              <p className="text-xs text-slate-500">{meta(nodeById(selEdge.from)).title} → {meta(nodeById(selEdge.to)).title}</p>
              <Field label="ป้ายกำกับ"><Input value={selEdge.label ?? ''} onChange={(e) => update((d) => { d.edges.find((x) => x.id === selEdge.id).label = e.target.value; return d })} placeholder="เช่น ผ่าน / ไม่ผ่าน" /></Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" className="accent-brand-600" checked={selEdge.kind === 'loop'} onChange={(e) => update((d) => { d.edges.find((x) => x.id === selEdge.id).kind = e.target.checked ? 'loop' : undefined; return d })} />
                <Undo2 className="size-4 text-amber-600" /> เส้นวนกลับ (Retry loop)
              </label>
              <Button size="sm" variant="danger" icon={Trash2} onClick={removeSelected}>ลบเส้นเชื่อม</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-900">ตั้งค่า Workflow</p>
              <Field label="คำอธิบาย"><Textarea rows={3} value={draft.description} onChange={(e) => update((d) => ({ ...d, description: e.target.value }))} /></Field>
              <Field label="แผนก">
                <Select value={draft.dept} onChange={(e) => update((d) => ({ ...d, dept: e.target.value }))}>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
              </Field>
              <div className="border-t border-slate-100 pt-4">
                <Field label="ข้อมูลสำหรับ Test run" hint="จำลองการทำงานจริง ดูสถานะของแต่ละ Node บน Canvas">
                  <Textarea rows={3} value={testInput} onChange={(e) => setTestInput(e.target.value)} />
                </Field>
                {run && (
                  <div className="rise mt-3 rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between"><StatusPill status={run.status} />
                      <Link to={`/workspace?run=${run.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">เปิดใน Workspace <ExternalLink className="size-3" /></Link>
                    </div>
                    {run.status === 'completed' && <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700"><CircleCheck className="size-3.5" /> ทำงานครบทุก Node รวมการวนกลับ {run.steps.reduce((n, s) => n + (s.kind === 'condition' ? s.loops : 0), 0)} ครั้ง</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
