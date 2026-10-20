import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, GitFork, History, TrendingUp } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { userById } from '../data/catalog'
import { fmt, fmtCompact, uid } from '../lib/utils'
import { Card, CardHeader, PageHeader, StatCard } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { DeptBadge, Rating } from '../components/ui/Badge'
import { Segmented } from '../components/ui/Form'
import { Avatar, Modal } from '../components/ui/Overlay'
import EntityIcon from '../components/agents/EntityIcon'

function HistoryModal({ item, onClose }) {
  const versions = item.versions?.length ? item.versions : [{ v: item.version, date: item.updated ?? '2026-09-01', by: item.owner, note: 'เวอร์ชันปัจจุบัน' }]
  return (
    <Modal open onClose={onClose} title={`Version history — ${item.name}`} subtitle="ทุกการเปลี่ยนแปลงถูกบันทึก ย้อนกลับเวอร์ชันได้">
      <ol className="relative space-y-5 border-l border-slate-200 pl-5">
        {versions.map((v, i) => (
          <li key={v.v} className="relative">
            <span className="absolute top-1 -left-[25px] size-2.5 rounded-full border-2 border-white bg-brand-500 ring-1 ring-brand-200" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">v{v.v} {i === 0 && <span className="ml-1 text-xs font-normal text-emerald-600">ล่าสุด</span>}</p>
              {i > 0 && <Button size="sm" variant="ghost">Restore</Button>}
            </div>
            <p className="text-xs text-slate-400">{v.date} · {userById(v.by).name}</p>
            <p className="mt-1 text-sm text-slate-600">{v.note}</p>
          </li>
        ))}
      </ol>
    </Modal>
  )
}

export default function Community() {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('agents')
  const [history, setHistory] = useState(null)

  const rows = {
    agents: state.agents.filter((a) => a.share !== 'private').map((a) => ({ ...a, icon: a.kind, to: `/agents/${a.id}` })),
    skills: state.skills.map((s) => ({ ...s, to: `/skills?open=${s.id}`, skill: true })),
    workflows: state.workflows.map((w) => ({ ...w, icon: 'condition', to: `/workflows?id=${w.id}`, skill: true })),
  }[tab].sort((a, b) => b.uses - a.uses)

  const fork = (item) => {
    if (tab === 'agents') return navigate(`/agents/new?from=${item.id}`)
    if (tab === 'skills') {
      const copy = { ...item, id: uid('skill'), name: `${item.name} (Fork)`, owner: state.userId, share: 'private', uses: 0, rating: 0, version: '1.0', versions: [] }
      delete copy.to
      actions.addSkill(copy)
      actions.toast(`Fork “${item.name}” เป็น Skill ส่วนตัวแล้ว`)
      return navigate(`/skills?open=${copy.id}`)
    }
    const copy = { ...structuredClone(state.workflows.find((w) => w.id === item.id)), id: uid('wf'), name: `${item.name} (Fork)`, owner: state.userId, uses: 0 }
    actions.saveWorkflow(copy)
    actions.toast(`Fork “${item.name}” แล้ว — แก้ไขต่อได้ทันที`)
    navigate(`/workflows?id=${copy.id}`)
  }

  const contributors = Object.values(
    [...state.agents, ...state.skills].reduce((m, x) => {
      const c = m[x.owner] ?? { id: x.owner, items: 0, uses: 0 }
      return { ...m, [x.owner]: { ...c, items: c.items + 1, uses: c.uses + x.uses } }
    }, {}),
  ).sort((a, b) => b.uses - a.uses).slice(0, 5)

  return (
    <div>
      <PageHeader eyebrow="แบ่งปันความรู้" title="ชุมชน" subtitle="สิ่งที่เพื่อนร่วมงานสร้างและแชร์ — นำไปใช้ต่อ Fork ไปปรับ และให้คะแนน เพื่อให้ความรู้ของบริษัทเติบโตร่วมกัน" />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Shared agents" value={state.agents.filter((a) => a.share !== 'private').length} hint="ใช้ได้ทั้งแผนก/บริษัท" />
        <StatCard label="Shared skills" value={state.skills.length} />
        <StatCard label="Forks this month" value="126" trend="+18%" />
        <StatCard label="Contributors" value="84" hint="จาก 9 แผนก" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <div className="flex flex-col gap-3 px-5 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900"><TrendingUp className="size-4 text-slate-400" /> ใช้มากที่สุด</h2>
            <Segmented value={tab} onChange={setTab} options={[{ value: 'agents', label: 'ผู้ช่วย' }, { value: 'skills', label: 'ทักษะ' }, { value: 'workflows', label: 'สายงาน' }]} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-y border-slate-100 bg-slate-50/60 text-left text-xs text-slate-500">
                <tr>
                  <th className="w-10 px-5 py-2 font-medium">#</th>
                  <th className="py-2 font-medium">ชื่อ</th>
                  <th className="py-2 font-medium">สร้างโดย</th>
                  <th className="py-2 font-medium">คะแนน</th>
                  <th className="py-2 font-medium">ใช้งาน</th>
                  <th className="py-2 font-medium">เวอร์ชัน</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 text-xs font-semibold text-slate-400">{i + 1}</td>
                    <td className="py-3 pr-4">
                      <Link to={r.to} className="flex items-center gap-3">
                        <EntityIcon icon={r.icon} size="sm" tone={r.skill ? 'skill' : 'agent'} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-800 hover:text-brand-700">{r.name}</span>
                          {r.dept ? <DeptBadge dept={r.dept} /> : <span className="text-xs text-slate-500">{r.category}</span>}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3"><span className="flex items-center gap-2 text-slate-600"><Avatar name={userById(r.owner).name} size="sm" />{userById(r.owner).name}</span></td>
                    <td className="py-3"><Rating value={r.rating} /></td>
                    <td className="py-3 text-slate-600">{fmt(r.uses)}</td>
                    <td className="py-3"><button type="button" onClick={() => setHistory(r)} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-700"><History className="size-3.5" />v{r.version}</button></td>
                    <td className="px-5 py-3 text-right"><Button size="sm" icon={GitFork} onClick={() => fork(r)}>คัดลอก</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader icon={Award} title="Top contributors" subtitle="คนที่สร้างสิ่งที่ทั้งบริษัทใช้มากที่สุด" />
            <ul className="px-5 pb-5">
              {contributors.map((c, i) => {
                const u = userById(c.id)
                return (
                  <li key={c.id} className="flex items-center gap-3 py-2">
                    <span className="w-4 text-xs font-semibold text-slate-400">{i + 1}</span>
                    <Avatar name={u.name} />
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium text-slate-800">{u.name}</div><div className="truncate text-xs text-slate-500">{u.title}</div></div>
                    <div className="text-right text-xs text-slate-500"><div className="font-medium text-slate-700">{fmtCompact(c.uses)}</div>{c.items} items</div>
                  </li>
                )
              })}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">แชร์อย่างไรให้คนใช้เยอะ</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
              <li>ตั้งชื่อตามงาน ไม่ใช่ตามเทคโนโลยี</li>
              <li>ใส่ตัวอย่างคำสั่ง 2–3 แบบ</li>
              <li>ใช้ Skill มาตรฐานของบริษัทแทนการเขียนใหม่</li>
              <li>บันทึก Version note ทุกครั้งที่แก้ไข</li>
            </ul>
          </Card>
        </div>
      </div>
      {history && <HistoryModal item={history} onClose={() => setHistory(null)} />}
    </div>
  )
}
