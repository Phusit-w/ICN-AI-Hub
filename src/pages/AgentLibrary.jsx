import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Plus, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { isAdminView, useStore } from '../store/AppStore'
import { modelById, userById } from '../data/catalog'
import { cn, matchScore, rankByMatch } from '../lib/utils'
import { agentSearchText } from '../lib/agentDraft'
import { applyShareFilter, SHARE_FILTERS, shareFilterFrom } from '../lib/sharing'
import Button from '../components/ui/Button'
import { Select } from '../components/ui/Form'
import { ItemCard } from '../components/agents/AgentCard'
import EntityIcon from '../components/agents/EntityIcon'
import { hasSteps, stepAgents, stepsLabel } from '../lib/steps'
import SkillDialog from '../components/skills/SkillDialog'
import TypewriterHint from '../components/ui/TypewriterHint'
import EyeTracker from '../components/ui/EyeTracker'
import AgentCube from '../components/agents/AgentCube'
import { ROLE_LABELS } from '../lib/cube'
import { useCube } from '../lib/useCube'

// Example searches typed out over the empty search box.
const HINTS = ['ทำ proposal ให้ลูกค้า', 'ขอวันลา / สวัสดิการ', 'VPN ต่อไม่ได้', 'ปิดงบประจำเดือน']

const chipClass = (on) => cn('h-8 shrink-0 rounded-full border px-3 text-[13px] transition', on ? 'border-brand-400 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')

const SORTS = {
  popular: (a, b) => b.uses - a.uses,
  newest: (a, b) => b.updated.localeCompare(a.updated),
}

/** The card's lead: an Agent with Steps is drawn as a small stack (a team), a single Agent as one icon tile or, with Cubes on, a Cube. */
function CardLead({ agent, cube }) {
  const { state } = useStore()
  const team = hasSteps(agent)
  if (cube) {
    const [first, second] = stepAgents(agent, state.agents)
    const label = team ? `ทีม ${stepsLabel(agent)}` : ROLE_LABELS[agent.kind]
    return (
      <span className="flex flex-col items-start gap-0.5">
        {team ? (
          <span className="relative block h-12 w-[72px]">
            {second && <span className="absolute top-1 left-10 opacity-70"><AgentCube agent={second} size={36} calm /></span>}
            {first && <span className="absolute top-0.5 left-5 opacity-85"><AgentCube agent={first} size={40} calm /></span>}
            <span className="absolute top-0 left-0"><AgentCube agent={agent} size={48} calm /></span>
          </span>
        ) : <AgentCube agent={agent} size={48} calm />}
        {label && <span className="text-[11px] text-slate-400">{label}</span>}
      </span>
    )
  }
  if (!team) return <EntityIcon icon={agent.kind} />
  return (
    <span className="relative mr-2.5 mb-2.5 inline-flex">
      <span className="absolute top-2.5 left-2.5 size-9 rounded-lg bg-brand-50 ring-1 ring-inset ring-brand-100" aria-hidden />
      <span className="absolute top-1.5 left-1.5 size-9 rounded-lg bg-brand-100 ring-1 ring-inset ring-brand-200" aria-hidden />
      <EntityIcon icon={agent.kind} className="relative" />
    </span>
  )
}

/** An Agent in the clean card shape. `best` marks the top recommendation for a typed need: its "ใช้งาน" is the page's one primary. */
function AgentCard({ agent, best = false, ...props }) {
  const [cube] = useCube()
  const team = hasSteps(agent)
  return (
  <ItemCard
    lead={<CardLead agent={agent} cube={cube} />}
    icon={agent.kind} name={agent.name} description={agent.description} favoriteId={agent.id}
    badge={cube ? undefined : team ? `ทีม ${stepsLabel(agent)}` : undefined}
    to={`/agents/${agent.id}`} useTo={`/workspace?agent=${agent.id}`} primary={best}
    className={best ? 'border-brand-400' : undefined} {...props}
  />
  )
}

function CreateFromSearch({ q }) {
  return (
    <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-6 text-center">
      <p className="text-sm text-slate-600">ยังไม่มี Agent สำหรับ “{q}”</p>
      <Button variant="primary" icon={Sparkles} to={`/agents/new?q=${encodeURIComponent(q)}`} className="mt-3">สร้าง Agent สำหรับ “{q}”</Button>
      <p className="mt-2 text-xs text-slate-400">AI จะกรอกรายละเอียดให้ คุณแค่ตรวจแล้วกดสร้าง</p>
    </div>
  )
}

/**
 * The AI Agent page: find an Agent for a job, or build one with "＋ สร้าง Agent".
 * Skills have no tab here (spec story 40); `?skill=<id>` opens one Skill's detail over the page.
 */
export default function AgentLibrary() {
  const { state } = useStore()
  const me = userById(state.userId)
  const [q, setQ] = useState('')
  const [cube] = useCube()
  const [focused, setFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  // Choosing by model is the Admin's concern; in the User view the system picks where each Agent runs.
  const [pickedLocation, setLocation] = useState('all')
  const showModelFilter = isAdminView(state)
  const location = showModelFilter ? pickedLocation : 'all'
  const [share, setShare] = useState('all')
  const [team, setTeam] = useState('all') // all | single | team: Agents with Steps are told apart from single ones
  const [sort, setSort] = useState('popular')
  const [params, setParams] = useSearchParams()
  const filter = shareFilterFrom(params)

  const hinting = !q && !focused
  const term = q.trim()
  // Recommendations answer "which one should I use for this?", so they show once the user says what the job is.
  // Before that the list below is the answer (Favourites are already one click away on the new-chat screen).
  const picks = useMemo(() => {
    if (term) return rankByMatch([...state.agents].sort(SORTS.popular), agentSearchText, term)
    return []
  }, [state.agents, term])
  const top = picks.slice(0, 3)

  // With a share filter on, the list is the answer and the recommendations are hidden, 
  const listTerm = filter ? term : q.trim()
  const list = useMemo(() => applyShareFilter(state.agents
    .filter((a) => !listTerm || matchScore(agentSearchText(a), listTerm) > 0)
    .filter((a) => location === 'all' || modelById(a.model).location === location)
    .filter((a) => share === 'all' || a.share === share)
    .filter((a) => team === 'all' || (team === 'team') === hasSteps(a))
    .sort(SORTS[sort]), filter, me), [state.agents, listTerm, location, share, team, sort, filter, me])

  const typedNoMatch = q.trim() && top.length === 0
  // Recommendations bring their own primary ("ใช้งาน" on the best pick, or "สร้าง Agent สำหรับ …"), so creating steps back.
  const showPicks = !filter && term

  return (
    <div className="mx-auto max-w-5xl" data-eyt-frame>
      <div className="flex justify-end">
        <Button variant={showPicks ? 'secondary' : 'primary'} icon={Plus} to="/agents/new" data-tour="agents-create">สร้าง Agent</Button>
      </div>
      <section className="text-center">
        {cube && <div className="eyt-fit mt-2 flex justify-center"><EyeTracker size={88} accessory="magnifier" /></div>}
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">หา AI Agent ที่เหมาะกับงาน</h1>
        <p className="mt-1 text-sm text-slate-500">บอกงานมา เราจะแนะนำ AI Agent ที่เหมาะที่สุดให้ หรือเลือกเองจากรายการด้านล่าง</p>
        <div className="relative mx-auto mt-5 max-w-xl">
          <input
            value={q} onChange={(e) => { setQ(e.target.value) }} aria-label="ค้นหา Agent จากงานที่อยากให้ช่วย"
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder={hinting ? '' : 'เช่น ทำ proposal ให้ลูกค้า, วันลา, VPN'}
            className="block h-12 w-full rounded-2xl border border-slate-200 bg-white px-5 text-[15px] shadow-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          />
          {hinting && <TypewriterHint phrases={HINTS} className="px-5 text-left text-[15px] leading-[48px]" />}
        </div>
        {filter && (
          <div className="mt-3 flex justify-center">
            <button
              type="button" aria-label={`ล้างตัวกรอง ${SHARE_FILTERS.find((f) => f.id === filter).label}`}
              onClick={() => setParams((p) => { const next = new URLSearchParams(p); next.delete('filter'); return next })}
              className={cn(chipClass(true), 'inline-flex items-center gap-1')}
            >{SHARE_FILTERS.find((f) => f.id === filter).label}<X className="size-3.5" aria-hidden /></button>
          </div>
        )}
      </section>

      {/* With a share filter on, the filtered list is the answer, so it moves up in place of the recommendations. */}
      {showPicks && (
        <section className="mt-8">
          <h2 id="agent-picks" className="mb-3 text-sm font-medium text-slate-500">แนะนำสำหรับงานนี้</h2>
          {typedNoMatch ? <CreateFromSearch q={q.trim()} /> : (
            <ul className="grid gap-4 md:grid-cols-3" aria-labelledby="agent-picks">
              {top.map((a, i) => <AgentCard key={a.id} agent={a} best={i === 0} />)}
            </ul>
          )}
        </section>
      )}

      <section className={filter || !term ? 'mt-8' : 'mt-10'}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Agent ทั้งหมด <span className="font-normal text-slate-400">({list.length})</span></h2>
          <button
            type="button" onClick={() => setShowFilters(!showFilters)} aria-pressed={showFilters}
            className={cn('ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px]', showFilters ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
          ><SlidersHorizontal className="size-3.5" /> ตัวกรอง</button>
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
            <Select value={team} onChange={(e) => setTeam(e.target.value)} className="w-auto" aria-label="ชนิด">
              <option value="all">ทุกชนิด</option><option value="single">Agent เดี่ยว</option><option value="team">ทีมหลายขั้นตอน</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto" aria-label="เรียงตาม">
              <option value="popular">ใช้บ่อยที่สุด</option><option value="newest">อัปเดตล่าสุด</option>
            </Select>
          </div>
        )}
        {list.length === 0 ? (
          (!typedNoMatch || filter) && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">ไม่มี Agent ตรงตัวกรองนี้</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3" aria-label="รายการ Agent">
            {list.map((a) => <AgentCard key={a.id} agent={a} />)}
          </ul>
        )}
        <Link to="/agents/new" className="mt-4 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-brand-700">ไม่เจอที่ต้องการ? สร้าง Agent ของคุณเอง ไม่ต้องเขียนโค้ด <ArrowRight className="size-3.5" /></Link>
      </section>
      <SkillDialog />
    </div>
  )
}
