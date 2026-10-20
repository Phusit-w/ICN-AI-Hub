// PROTOTYPE — throwaway. Three layouts for the Agents page on /agents?variant=A|B|C.
// Behaviour fixed by the grilling session (Q5, Q12): one-click "ใช้งาน", favourites on top,
// filters tucked away, and "create an agent for <search>" when nothing matches.
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, Plus, Search, SlidersHorizontal, Sparkles, Star } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { DEPARTMENTS, deptById, modelById, userById } from '../data/catalog'
import { cn, fmtCompact } from '../lib/utils'
import Button from '../components/ui/Button'
import { DeptBadge, Rating } from '../components/ui/Badge'
import { Select } from '../components/ui/Form'
import EntityIcon from '../components/agents/EntityIcon'
import { FavoriteButton } from '../components/agents/AgentCard'
import PrototypeSwitcher, { useVariant } from '../components/ui/PrototypeSwitcher'

const NEEDS = [
  { label: 'ทำเอกสารให้ลูกค้า', q: 'proposal' },
  { label: 'ค้นข้อมูล / สรุปรายงาน', q: 'ค้น' },
  { label: 'ถามเรื่อง HR / สวัสดิการ', dept: 'hr' },
  { label: 'แจ้งปัญหา IT', dept: 'it' },
  { label: 'งานบัญชี / ปิดงบ', dept: 'accounting' },
]

/** Crude relevance: how many words of the query appear in the agent's text. 0 = no match. */
function score(agent, q) {
  const text = `${agent.name} ${agent.description} ${agent.examples.join(' ')}`.toLowerCase()
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length > 1)
  return words.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0)
}

function useAgents() {
  const { state } = useStore()
  const me = userById(state.userId)
  const favorites = state.favorites.map((id) => state.agents.find((a) => a.id === id)).filter(Boolean)
  return { agents: state.agents, favorites, me }
}

function CreateFromSearch({ q }) {
  return (
    <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-6 text-center">
      <p className="text-sm text-slate-600">ยังไม่มีผู้ช่วยสำหรับ “{q}”</p>
      <Button variant="primary" icon={Sparkles} to={`/agents/new?q=${encodeURIComponent(q)}`} className="mt-3">สร้างผู้ช่วยสำหรับ “{q}”</Button>
      <p className="mt-2 text-xs text-slate-400">AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง</p>
    </div>
  )
}

const UseButton = ({ agent, className, size = 'sm' }) => (
  <Button variant="primary" size={size} icon={Play} to={`/workspace?agent=${agent.id}`} className={className}>ใช้งาน</Button>
)

/* ───────────── A: search-first — one big box, results as a plain list ───────────── */
function VariantA() {
  const { agents, favorites } = useAgents()
  const [q, setQ] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [location, setLocation] = useState('all')
  const [sort, setSort] = useState('popular')
  const term = q.trim()
  const results = useMemo(() => agents
    .map((a) => ({ a, s: term ? score(a, term) : 1 }))
    .filter(({ a, s }) => s > 0 && (location === 'all' || modelById(a.model).location === location))
    .sort((x, y) => y.s - x.s || (sort === 'rating' ? y.a.rating - x.a.rating : y.a.uses - x.a.uses))
    .map(({ a }) => a), [agents, term, location, sort])

  return (
    <div className="mx-auto max-w-3xl pt-4 lg:pt-10">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">หาผู้ช่วย AI</h1>
      <div className="mt-5 flex gap-2">
        <label className="flex h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
          <Search className="size-5 text-slate-400" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="พิมพ์งานที่อยากให้ช่วย เช่น proposal, วันลา, VPN" className="flex-1 bg-transparent text-[15px] focus:outline-none" aria-label="ค้นหาผู้ช่วย" />
        </label>
        <button type="button" onClick={() => setShowFilters(!showFilters)} aria-pressed={showFilters} className={cn('flex h-12 items-center gap-1.5 rounded-2xl border px-4 text-sm', showFilters ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600')}>
          <SlidersHorizontal className="size-4" /> ตัวกรอง
        </button>
      </div>
      {showFilters && (
        <div className="rise mt-2 flex flex-wrap gap-2">
          <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto" aria-label="ประเภท Model">
            <option value="all">ทุก Model</option><option value="local">Local AI</option><option value="cloud">Cloud AI</option><option value="auto">Auto</option>
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto" aria-label="เรียงตาม">
            <option value="popular">ใช้บ่อยที่สุด</option><option value="rating">คะแนนสูงสุด</option>
          </Select>
        </div>
      )}

      {!term && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400">ผู้ช่วยประจำ:</span>
          {favorites.map((a) => (
            <Link key={a.id} to={`/workspace?agent=${a.id}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 text-sm text-slate-700 hover:border-brand-300">
              <EntityIcon icon={a.kind} size="sm" className="!rounded-full" />{a.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        {results.length === 0 ? <CreateFromSearch q={term} /> : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {results.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <EntityIcon icon={a.kind} />
                <Link to={`/agents/${a.id}`} className="min-w-0 flex-1">
                  <span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-slate-900">{a.name}</span><DeptBadge dept={a.dept} /></span>
                  <span className="block truncate text-[13px] text-slate-500">{a.description}</span>
                </Link>
                <span className="hidden text-xs text-slate-400 sm:block">ใช้ {fmtCompact(a.uses)} ครั้ง</span>
                <UseButton agent={a} />
              </li>
            ))}
          </ul>
        )}
        {results.length > 0 && <Link to="/agents/new" className="mt-4 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">ไม่เจอที่ต้องการ? สร้างผู้ช่วยของคุณเอง <ArrowRight className="size-3.5" /></Link>}
      </div>
    </div>
  )
}

/* ───────────── B: gallery — big visual cards grouped into shelves ───────────── */
const SHELF_TINT = { core: 'from-brand-500 to-violet-500', sales: 'from-sky-500 to-cyan-400', hr: 'from-rose-400 to-pink-400', it: 'from-teal-500 to-emerald-400', accounting: 'from-amber-500 to-orange-400' }

function GalleryCard({ agent }) {
  return (
    <div className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn('relative flex h-24 items-end bg-gradient-to-br p-3', SHELF_TINT[deptById(agent.dept).id])}>
        <EntityIcon icon={agent.kind} size="lg" className="!bg-white/95 shadow" />
        <FavoriteButton id={agent.id} className="absolute top-2 right-2 bg-white/80" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <Link to={`/agents/${agent.id}`} className="text-[15px] font-semibold text-slate-900 hover:text-brand-700">{agent.name}</Link>
        <p className="mt-1 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-500">{agent.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400"><Rating value={agent.rating} /><span>ใช้ {fmtCompact(agent.uses)} ครั้ง</span></div>
        <UseButton agent={agent} size="md" className="mt-3 w-full justify-center" />
      </div>
    </div>
  )
}

function Shelf({ title, subtitle, agents }) {
  if (!agents.length) return null
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-2"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{subtitle && <span className="text-sm text-slate-400">{subtitle}</span>}</div>
      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-3">{agents.map((a) => <GalleryCard key={a.id} agent={a} />)}</div>
    </section>
  )
}

function VariantB() {
  const { agents, favorites, me } = useAgents()
  const [q, setQ] = useState('')
  const term = q.trim()
  const hits = agents.filter((a) => score(a, term) > 0)
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">ผู้ช่วย AI</h1>
          <p className="mt-1 text-slate-500">เลือกผู้ช่วยที่ถนัดงานของคุณ แล้วกดใช้งานได้เลย</p>
        </div>
        <label className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 sm:w-80">
          <Search className="size-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา…" className="flex-1 bg-transparent text-sm focus:outline-none" aria-label="ค้นหาผู้ช่วย" />
        </label>
      </div>
      {term ? (
        hits.length ? <Shelf title={`ผลการค้นหา “${term}”`} agents={hits} /> : <CreateFromSearch q={term} />
      ) : (
        <>
          <Shelf title="ผู้ช่วยประจำของคุณ" agents={favorites} />
          <Shelf title={`ยอดนิยมใน${deptById(me.dept).th}`} agents={agents.filter((a) => a.dept === me.dept).sort((x, y) => y.uses - x.uses)} />
          {DEPARTMENTS.filter((d) => d.id !== me.dept).map((d) => (
            <Shelf key={d.id} title={d.th} subtitle={d.name} agents={agents.filter((a) => a.dept === d.id)} />
          ))}
          <Link to="/agents/new" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 text-sm font-medium text-slate-500 hover:border-brand-300 hover:text-brand-700"><Plus className="size-4" /> สร้างผู้ช่วยของคุณเอง</Link>
        </>
      )}
    </div>
  )
}

/* ───────────── C: recommender — ask the need, show the top three with reasons ───────────── */
function VariantC() {
  const { agents, favorites, me } = useAgents()
  const [q, setQ] = useState('')
  const [need, setNeed] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const term = q.trim()

  let picks, why
  if (need?.dept) { picks = agents.filter((a) => a.dept === need.dept).sort((x, y) => y.uses - x.uses); why = () => `ผู้ช่วยของ${deptById(need.dept).th} ใช้บ่อยที่สุด` }
  else if (term || need?.q) {
    const t = term || need.q
    picks = agents.map((a) => ({ a, s: score(a, t) })).filter((x) => x.s > 0).sort((x, y) => y.s - x.s || y.a.uses - x.a.uses).map((x) => x.a)
    why = (a) => (a.examples[0] ? `เคยใช้ทำงานแบบ “${a.examples[0]}”` : 'ตรงกับคำที่คุณพิมพ์')
  } else {
    picks = [...favorites, ...agents.filter((a) => a.dept === me.dept && !favorites.includes(a))]
    why = (a) => (favorites.includes(a) ? 'อยู่ในผู้ช่วยประจำของคุณ' : `นิยมใน${deptById(me.dept).th}`)
  }
  const top = picks.slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl pt-4 lg:pt-8">
      <div className="text-center">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles className="size-6" /></span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">วันนี้อยากให้ช่วยเรื่องอะไร?</h1>
        <p className="mt-1 text-sm text-slate-500">บอกงานมา เราจะแนะนำผู้ช่วยที่เหมาะที่สุดให้</p>
        <input
          value={q} onChange={(e) => { setQ(e.target.value); setNeed(null) }} aria-label="บอกงานที่อยากให้ช่วย"
          placeholder="เช่น ทำ proposal ให้ลูกค้า"
          className="mx-auto mt-5 block h-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-5 text-[15px] shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {NEEDS.map((n) => (
            <button key={n.label} type="button" onClick={() => { setNeed(need === n ? null : n); setQ('') }} className={cn('rounded-full border px-3 py-1 text-[13px] transition', need === n ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')}>{n.label}</button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-slate-500">{term || need ? 'แนะนำสำหรับงานนี้' : 'แนะนำสำหรับคุณ'}</p>
        {top.length === 0 ? <CreateFromSearch q={term} /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((a, i) => (
              <div key={a.id} className={cn('flex flex-col rounded-2xl border bg-white p-5', i === 0 ? 'border-brand-300 shadow-md ring-4 ring-brand-50' : 'border-slate-200')}>
                {i === 0 && <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white"><Star className="size-3 fill-white" /> เหมาะที่สุด</span>}
                <div className="flex items-center gap-3"><EntityIcon icon={a.kind} /><Link to={`/agents/${a.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{a.name}</Link></div>
                <p className="mt-3 flex-1 text-[13px] leading-relaxed text-slate-600">{a.description}</p>
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">💡 {why(a)}</p>
                <UseButton agent={a} size="md" className="mt-4 w-full justify-center" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 text-center">
        <button type="button" onClick={() => setShowAll(!showAll)} className="text-sm font-medium text-brand-700 hover:underline">{showAll ? 'ซ่อนรายการทั้งหมด' : `หรือดูผู้ช่วยทั้งหมด (${agents.length})`}</button>
      </div>
      {showAll && (
        <ul className="rise mt-4 grid gap-1 sm:grid-cols-2">
          {agents.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-white">
              <EntityIcon icon={a.kind} size="sm" /><Link to={`/agents/${a.id}`} className="flex-1 truncate text-sm text-slate-700">{a.name}</Link>
              <Link to={`/workspace?agent=${a.id}`} className="text-xs font-medium text-brand-700 hover:underline">ใช้งาน</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const VARIANTS = { A: 'แนวค้นหาเป็นหลัก', B: 'แนวแกลเลอรี', C: 'แนวผู้ช่วยแนะนำ' }

export default function AgentLibraryPrototype() {
  const v = useVariant(Object.keys(VARIANTS))
  return (
    <>
      {v === 'A' && <VariantA />}
      {v === 'B' && <VariantB />}
      {v === 'C' && <VariantC />}
      <PrototypeSwitcher variants={VARIANTS} />
    </>
  )
}
