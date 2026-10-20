import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Lightbulb, Play, Plus, SlidersHorizontal, Sparkles, Star } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { deptById, modelById, userById } from '../data/catalog'
import { cn, fmtCompact, matchScore, rankByMatch } from '../lib/utils'
import { agentSearchText } from '../lib/agentDraft'
import Button from '../components/ui/Button'
import { DeptBadge, Rating } from '../components/ui/Badge'
import { Select } from '../components/ui/Form'
import EntityIcon from '../components/agents/EntityIcon'
import { FavoriteButton } from '../components/agents/AgentCard'

// One-tap shortcuts for people who don't know what to type yet.
const NEEDS = [
  { label: 'ทำเอกสารให้ลูกค้า', q: 'proposal ลูกค้า' },
  { label: 'ค้นข้อมูล / สรุปรายงาน', q: 'ค้น สรุป รายงาน' },
  { label: 'ถามเรื่อง HR / สวัสดิการ', dept: 'hr' },
  { label: 'แจ้งปัญหา IT', dept: 'it' },
  { label: 'งานบัญชี / ปิดงบ', dept: 'accounting' },
]

const SORTS = {
  popular: (a, b) => b.uses - a.uses,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => b.updated.localeCompare(a.updated),
}

const UseButton = ({ agent, size = 'sm', className }) => (
  <Button variant="primary" size={size} icon={Play} to={`/workspace?agent=${agent.id}`} className={className}>ใช้งาน</Button>
)

function Recommendation({ agent, reason, best }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl border bg-white transition hover:shadow-sm', best ? 'border-2 border-brand-400' : 'border-slate-200')}>
      <div className="flex items-start justify-between bg-brand-50 px-4 pt-4 pb-3">
        <EntityIcon icon={agent.kind} size="lg" className="!bg-white" />
        {best ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-semibold text-white"><Star className="size-3 fill-white" /> เหมาะที่สุด</span> : <DeptBadge dept={agent.dept} />}
      </div>
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <Link to={`/agents/${agent.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{agent.name}</Link>
        {best && <div className="mt-0.5"><DeptBadge dept={agent.dept} /></div>}
        <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-600">{agent.description}</p>
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500"><Lightbulb className="size-4 shrink-0 text-amber-500" aria-hidden />{reason}</p>
        <UseButton agent={agent} size="md" className="mt-4 w-full justify-center" />
      </div>
    </div>
  )
}

function CreateFromSearch({ q }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-6 text-center">
      <p className="text-sm text-slate-600">ยังไม่มีผู้ช่วยสำหรับ “{q}”</p>
      <Button variant="primary" icon={Sparkles} to={`/agents/new?q=${encodeURIComponent(q)}`} className="mt-3">สร้างผู้ช่วยสำหรับ “{q}”</Button>
      <p className="mt-2 text-xs text-slate-400">AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง</p>
    </div>
  )
}

export default function AgentLibrary() {
  const { state } = useStore()
  const me = userById(state.userId)
  const [q, setQ] = useState('')
  const [need, setNeed] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [location, setLocation] = useState('all')
  const [share, setShare] = useState('all')
  const [sort, setSort] = useState('popular')

  const term = q.trim() || need?.q || ''
  const favorites = state.favorites.map((id) => state.agents.find((a) => a.id === id)).filter(Boolean)

  // Recommendations answer "which one should I use?"; the list below answers "show me everything".
  const { picks, reason } = useMemo(() => {
    if (need?.dept) {
      return { picks: state.agents.filter((a) => a.dept === need.dept).sort(SORTS.popular), reason: () => `ใช้บ่อยที่สุดใน${deptById(need.dept).th}` }
    }
    if (term) {
      const popularFirst = [...state.agents].sort(SORTS.popular)
      return { picks: rankByMatch(popularFirst, agentSearchText, term), reason: (a) => (a.examples[0] ? `เคยใช้ทำงานแบบ “${a.examples[0]}”` : 'ตรงกับงานที่คุณพิมพ์') }
    }
    const mine = state.agents.filter((a) => a.dept === me.dept && !favorites.includes(a)).sort(SORTS.popular)
    return { picks: [...favorites, ...mine], reason: (a) => (favorites.includes(a) ? 'อยู่ในผู้ช่วยประจำของคุณ' : `นิยมใน${deptById(me.dept).th}`) }
  }, [state.agents, need, term, favorites, me.dept])
  const top = picks.slice(0, 3)

  const list = useMemo(() => state.agents
    .filter((a) => !q.trim() || matchScore(agentSearchText(a), q) > 0)
    .filter((a) => !need?.dept || a.dept === need.dept)
    .filter((a) => location === 'all' || modelById(a.model).location === location)
    .filter((a) => share === 'all' || a.share === share)
    .sort(SORTS[sort]), [state.agents, q, need, location, share, sort])

  const typedNoMatch = q.trim() && top.length === 0

  return (
    <div className="mx-auto max-w-5xl pt-2 lg:pt-6">
      <section className="text-center" data-tour="agents-filters">
        <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Sparkles className="size-6" /></span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">วันนี้อยากให้ช่วยเรื่องอะไร?</h1>
        <p className="mt-1 text-sm text-slate-500">บอกงานมา เราจะแนะนำผู้ช่วย AI ที่เหมาะที่สุดให้ หรือเลือกเองจากรายการด้านล่าง</p>
        <input
          value={q} onChange={(e) => { setQ(e.target.value); setNeed(null) }} aria-label="ค้นหาผู้ช่วยจากงานที่อยากให้ช่วย"
          placeholder="เช่น ทำ proposal ให้ลูกค้า, วันลา, VPN"
          className="mx-auto mt-5 block h-12 w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-5 text-[15px] shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {NEEDS.map((n) => (
            <button
              key={n.label} type="button" aria-pressed={need === n} onClick={() => { setNeed(need === n ? null : n); setQ('') }}
              className={cn('rounded-full border px-3 py-1 text-[13px] transition', need === n ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')}
            >{n.label}</button>
          ))}
        </div>
        {favorites.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400">ผู้ช่วยประจำของคุณ:</span>
            {favorites.map((a) => (
              <Link key={a.id} to={`/workspace?agent=${a.id}`} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 text-sm text-slate-700 hover:border-brand-300">
                <EntityIcon icon={a.kind} size="sm" className="!rounded-full" />{a.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <p className="mb-3 text-sm font-medium text-slate-500">{term || need ? 'แนะนำสำหรับงานนี้' : 'แนะนำสำหรับคุณ'}</p>
        {typedNoMatch ? <CreateFromSearch q={q.trim()} /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {top.map((a, i) => <Recommendation key={a.id} agent={a} reason={reason(a)} best={i === 0 && Boolean(term || need)} />)}
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">ผู้ช่วยทั้งหมด <span className="font-normal text-slate-400">({list.length})</span></h2>
          <button
            type="button" onClick={() => setShowFilters(!showFilters)} aria-pressed={showFilters}
            className={cn('ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px]', showFilters ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
          ><SlidersHorizontal className="size-3.5" /> ตัวกรอง</button>
          <Button variant="secondary" size="sm" icon={Plus} to="/agents/new" data-tour="agents-create">สร้างผู้ช่วย</Button>
        </div>
        {showFilters && (
          <div className="rise mb-3 flex flex-wrap gap-2">
            <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto" aria-label="ประเภท Model">
              <option value="all">ทุก Model</option><option value="local">Local AI</option><option value="cloud">Cloud AI</option><option value="auto">Auto routing</option>
            </Select>
            <Select value={share} onChange={(e) => setShare(e.target.value)} className="w-auto" aria-label="การแชร์">
              <option value="all">ทุกระดับการแชร์</option><option value="company">ทั้งบริษัท</option><option value="department">ในแผนก</option><option value="private">เฉพาะฉัน</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto" aria-label="เรียงตาม">
              <option value="popular">ใช้บ่อยที่สุด</option><option value="rating">คะแนนสูงสุด</option><option value="newest">อัปเดตล่าสุด</option>
            </Select>
          </div>
        )}
        {list.length === 0 ? (
          !typedNoMatch && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">ไม่มีผู้ช่วยตรงตัวกรองนี้</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white" data-tour="agent-card">
            {list.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                <EntityIcon icon={a.kind} />
                <Link to={`/agents/${a.id}`} className="min-w-0 flex-1">
                  <span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-slate-900">{a.name}</span><DeptBadge dept={a.dept} /></span>
                  <span className="block truncate text-[13px] text-slate-500">{a.description}</span>
                </Link>
                <span className="hidden items-center gap-3 text-xs text-slate-400 md:flex"><Rating value={a.rating} /><span>ใช้ {fmtCompact(a.uses)} ครั้ง</span></span>
                <FavoriteButton id={a.id} />
                <UseButton agent={a} />
              </li>
            ))}
          </ul>
        )}
        <Link to="/agents/new" className="mt-4 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">ไม่เจอที่ต้องการ? สร้างผู้ช่วยของคุณเอง ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
      </section>
    </div>
  )
}
