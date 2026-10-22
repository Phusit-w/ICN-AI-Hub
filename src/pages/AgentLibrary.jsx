import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Plus, SlidersHorizontal, Sparkles } from 'lucide-react'
import { isAdminView, useStore } from '../store/AppStore'
import { modelById, userById } from '../data/catalog'
import { cn, matchScore, rankByMatch } from '../lib/utils'
import { agentSearchText } from '../lib/agentDraft'
import { applyShareFilter, shareFilterFrom } from '../lib/sharing'
import ShareFilterChips from '../components/ui/ShareFilterChips'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Form'
import Tabs from '../components/ui/Tabs'
import { ItemCard } from '../components/agents/AgentCard'
import { stepsLabel } from '../lib/steps'
import SkillsTab from './SkillsTab'

// One-tap shortcuts for people who don't know what to type yet.
const NEEDS = [
  { label: 'ทำเอกสารให้ลูกค้า', q: 'proposal ลูกค้า' },
  { label: 'ตรวจ TOR / SOC', dept: 'bid' },
  { label: 'รายงานโครงการ / ส่งมอบงาน', dept: 'project' },
  { label: 'ซ่อมบำรุง / Incident', dept: 'maintenance' },
  { label: 'ค้นข้อมูล / สรุปรายงาน', q: 'ค้น สรุป รายงาน' },
  { label: 'ถามเรื่อง HR / สวัสดิการ', dept: 'hr' },
  { label: 'แจ้งปัญหา IT', dept: 'it' },
  { label: 'งานบัญชี / ปิดงบ', dept: 'accounting' },
]

const SORTS = {
  popular: (a, b) => b.uses - a.uses,
  newest: (a, b) => b.updated.localeCompare(a.updated),
}

/** An Agent in the clean card shape. `best` marks the top recommendation for a typed need: its "ใช้งาน" is the page's one primary. */
const AgentCard = ({ agent, best = false, ...props }) => (
  <ItemCard
    icon={agent.kind} name={agent.name} description={agent.description} favoriteId={agent.id} badge={stepsLabel(agent)}
    to={`/agents/${agent.id}`} useTo={`/workspace?agent=${agent.id}`} primary={best}
    className={best ? 'border-brand-400' : undefined} {...props}
  />
)

function CreateFromSearch({ q }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-6 text-center">
      <p className="text-sm text-slate-600">ยังไม่มีผู้ช่วยสำหรับ “{q}”</p>
      <Button variant="primary" icon={Sparkles} to={`/agents/new?q=${encodeURIComponent(q)}`} className="mt-3">สร้างผู้ช่วยสำหรับ “{q}”</Button>
      <p className="mt-2 text-xs text-slate-400">AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง</p>
    </div>
  )
}

function AgentsTab() {
  const { state } = useStore()
  const me = userById(state.userId)
  const [q, setQ] = useState('')
  const [need, setNeed] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  // Choosing by model is the Admin's concern; in the User view the system picks where each Agent runs.
  const [pickedLocation, setLocation] = useState('all')
  const showModelFilter = isAdminView(state)
  const location = showModelFilter ? pickedLocation : 'all'
  const [share, setShare] = useState('all')
  const [sort, setSort] = useState('popular')
  const [params] = useSearchParams()
  const filter = shareFilterFrom(params)

  const term = q.trim() || need?.q || ''
  // Recommendations answer "which one should I use for this?", so they show once the user says what the job is.
  // Before that the list below is the answer (Favourites are already one click away on the new-chat screen).
  const picks = useMemo(() => {
    if (need?.dept) return state.agents.filter((a) => a.dept === need.dept).sort(SORTS.popular)
    if (term) return rankByMatch([...state.agents].sort(SORTS.popular), agentSearchText, term)
    return []
  }, [state.agents, need, term])
  const top = picks.slice(0, 3)

  const list = useMemo(() => applyShareFilter(state.agents
    .filter((a) => !q.trim() || matchScore(agentSearchText(a), q) > 0)
    .filter((a) => !need?.dept || a.dept === need.dept)
    .filter((a) => location === 'all' || modelById(a.model).location === location)
    .filter((a) => share === 'all' || a.share === share)
    .sort(SORTS[sort]), filter, me), [state.agents, q, need, location, share, sort, filter, me])

  const typedNoMatch = q.trim() && top.length === 0

  return (
    <>
      <section className="text-center">
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">หาผู้ช่วย AI ที่เหมาะกับงาน</h1>
        <p className="mt-1 text-sm text-slate-500">บอกงานมา เราจะแนะนำผู้ช่วย AI ที่เหมาะที่สุดให้ หรือเลือกเองจากรายการด้านล่าง</p>
        <ShareFilterChips className="mt-4 justify-center overflow-x-auto" />
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
      </section>

      {/* With a share filter on, the filtered list is the answer, so it moves up in place of the recommendations. */}
      {!filter && (term || need) && (
        <section className="mt-8">
          <h2 id="agent-picks" className="mb-3 text-sm font-medium text-slate-500">แนะนำสำหรับงานนี้</h2>
          {typedNoMatch ? <CreateFromSearch q={q.trim()} /> : (
            <ul className="grid gap-4 md:grid-cols-3" aria-labelledby="agent-picks">
              {top.map((a, i) => <AgentCard key={a.id} agent={a} best={i === 0} />)}
            </ul>
          )}
        </section>
      )}

      <section className={filter || !(term || need) ? 'mt-8' : 'mt-10'}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">ผู้ช่วยทั้งหมด <span className="font-normal text-slate-400">({list.length})</span></h2>
          <button
            type="button" onClick={() => setShowFilters(!showFilters)} aria-pressed={showFilters}
            className={cn('ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px]', showFilters ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
          ><SlidersHorizontal className="size-3.5" /> ตัวกรอง</button>
          <Button variant="secondary" size="sm" icon={Plus} to="/agents/new">สร้างผู้ช่วย</Button>
        </div>
        {showFilters && (
          <div className="rise mb-3 flex flex-wrap gap-2">
            {showModelFilter && (
              <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto" aria-label="ประเภท Model">
                <option value="all">ทุก Model</option><option value="local">Local AI</option><option value="cloud">Cloud AI</option><option value="auto">Auto routing</option>
              </Select>
            )}
            <Select value={share} onChange={(e) => setShare(e.target.value)} className="w-auto" aria-label="การแชร์">
              <option value="all">ทุกระดับการแชร์</option><option value="company">ทั้งบริษัท</option><option value="department">ในแผนก</option><option value="private">เฉพาะฉัน</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto" aria-label="เรียงตาม">
              <option value="popular">ใช้บ่อยที่สุด</option><option value="newest">อัปเดตล่าสุด</option>
            </Select>
          </div>
        )}
        {list.length === 0 ? (
          (!typedNoMatch || filter) && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">ไม่มีผู้ช่วยตรงตัวกรองนี้</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3" aria-label="รายการผู้ช่วย">
            {list.map((a) => <AgentCard key={a.id} agent={a} />)}
          </ul>
        )}
        <Link to="/agents/new" className="mt-4 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">ไม่เจอที่ต้องการ? สร้างผู้ช่วยของคุณเอง ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
      </section>
    </>
  )
}

const TABS = [
  { id: 'agents', label: 'ผู้ช่วย', content: <AgentsTab /> },
  { id: 'skills', label: 'ทักษะ', content: <SkillsTab /> },
]

/** The Agents page: "ผู้ช่วย" and "ทักษะ" tabs. The tab lives in the URL (`?tab=skills`) so it can be linked. */
export default function AgentLibrary() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'skills' ? 'skills' : 'agents'
  return (
    <Tabs
      label="คลังผู้ช่วย AI" tabs={TABS} value={tab} className="mx-auto max-w-5xl" listProps={{ 'data-tour': 'agents-tabs' }}
      onChange={(t) => setParams(t === 'skills' ? { tab: t } : {})}
    />
  )
}
