import { useMemo, useState } from 'react'
import { Bot, Plus, Star } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { DEPARTMENTS, modelById } from '../data/catalog'
import { cn } from '../lib/utils'
import { EmptyState, PageHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { SearchInput, Segmented, Select } from '../components/ui/Form'
import AgentCard from '../components/agents/AgentCard'

const SORTS = {
  popular: (a, b) => b.uses - a.uses,
  rating: (a, b) => b.rating - a.rating,
  newest: (a, b) => b.updated.localeCompare(a.updated),
}

export default function AgentLibrary() {
  const { state } = useStore()
  const [q, setQ] = useState('')
  const [dept, setDept] = useState('all')
  const [location, setLocation] = useState('all')
  const [share, setShare] = useState('all')
  const [sort, setSort] = useState('popular')
  const [favOnly, setFavOnly] = useState(false)

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return state.agents
      .filter((a) => !term || `${a.name} ${a.description}`.toLowerCase().includes(term))
      .filter((a) => location === 'all' || modelById(a.model).location === location)
      .filter((a) => share === 'all' || a.share === share)
      .filter((a) => !favOnly || state.favorites.includes(a.id))
      .sort(SORTS[sort])
  }, [state.agents, state.favorites, q, location, share, sort, favOnly])

  const deptOptions = [
    { value: 'all', label: 'ทั้งหมด', count: filtered.length },
    ...DEPARTMENTS.map((d) => ({ value: d.id, label: d.name, count: filtered.filter((a) => a.dept === d.id).length })),
  ]
  // "All" groups by department so people can browse their own team's agents first.
  const sections = dept === 'all'
    ? DEPARTMENTS.map((d) => ({ dept: d, agents: filtered.filter((a) => a.dept === d.id) })).filter((s) => s.agents.length)
    : [{ dept: DEPARTMENTS.find((d) => d.id === dept), agents: filtered.filter((a) => a.dept === dept) }]

  return (
    <div>
      <PageHeader
        eyebrow="คลัง" title="คลังผู้ช่วย AI (Agents)"
        subtitle="ผู้ช่วย AI ทั้งหมดในบริษัท แต่ละตัวถนัดงานต่างกัน กดใช้งานได้ทันที หรือคัดลอกไปปรับเป็นของแผนกคุณ"
        actions={<Button variant="primary" icon={Plus} to="/agents/new" data-tour="agents-create">สร้างผู้ช่วยใหม่</Button>}
      />

      <div className="mb-6 space-y-3" data-tour="agents-filters">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput placeholder="ค้นหาจากชื่อหรือความสามารถ เช่น “proposal”, “วันลา”" value={q} onChange={(e) => setQ(e.target.value)} className="lg:w-96" aria-label="ค้นหาผู้ช่วย" />
          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Select value={location} onChange={(e) => setLocation(e.target.value)} className="w-auto" aria-label="ประเภท Model">
              <option value="all">ทุก Model</option>
              <option value="local">Local AI</option>
              <option value="cloud">Cloud AI</option>
              <option value="auto">Auto routing</option>
            </Select>
            <Select value={share} onChange={(e) => setShare(e.target.value)} className="w-auto" aria-label="การแชร์">
              <option value="all">ทุกระดับการแชร์</option>
              <option value="company">Company</option>
              <option value="department">Department</option>
              <option value="private">Private</option>
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-auto" aria-label="เรียงตาม">
              <option value="popular">ใช้บ่อยที่สุด</option>
              <option value="rating">คะแนนสูงสุด</option>
              <option value="newest">อัปเดตล่าสุด</option>
            </Select>
            <button
              type="button" onClick={() => setFavOnly(!favOnly)} aria-pressed={favOnly}
              className={cn('inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition', favOnly ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}
            >
              <Star className={cn('size-4', favOnly && 'fill-amber-400 text-amber-400')} /> รายการโปรด
            </button>
          </div>
        </div>
        <Segmented options={deptOptions} value={dept} onChange={setDept} />
      </div>

      {sections.every((s) => !s.agents.length) ? (
        <EmptyState icon={Bot} title="ไม่พบผู้ช่วยที่ตรงเงื่อนไข" action={<Button to="/agents/new" icon={Plus}>สร้างผู้ช่วยใหม่</Button>}>
          ลองเปลี่ยนคำค้นหรือตัวกรอง หรือสร้าง Agent ของคุณเอง
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {sections.map(({ dept: d, agents }) => (
            <section key={d.id}>
              <div className="mb-3 flex items-baseline gap-2">
                <span className={cn('size-2 rounded-full', d.dot)} aria-hidden />
                <h2 className="text-[15px] font-semibold text-slate-900">{d.name}</h2>
                <span className="text-xs text-slate-500">{d.th} · {agents.length} ตัว</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {agents.map((a) => <AgentCard key={a.id} agent={a} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
