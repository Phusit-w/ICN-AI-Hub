import { Plus } from 'lucide-react'
import { userById } from '../../data/catalog'
import { fmtCompact } from '../../lib/utils'
import EntityIcon from '../agents/EntityIcon'
import Badge, { Rating, ShareBadge } from '../ui/Badge'
import Button from '../ui/Button'

export default function SkillCard({ skill, usedBy, onOpen, onAttach }) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <EntityIcon icon={skill.icon} tone="skill" />
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="block truncate text-left text-sm font-semibold text-slate-900 hover:text-brand-700">{skill.name}</button>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500"><Badge>{skill.category}</Badge><span>v{skill.version}</span></div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 min-h-10 text-[13px] leading-relaxed text-slate-600">{skill.purpose}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>ใช้กับผู้ช่วย <span className="font-medium text-slate-700">{usedBy}</span> ตัว</span>
        <span className="flex items-center gap-3"><Rating value={skill.rating} /><span>ใช้ {fmtCompact(skill.uses)} ครั้ง</span></span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          <ShareBadge share={skill.share} /><span className="truncate">โดย {userById(skill.owner).name}</span>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={onOpen}>รายละเอียด</Button>
          <Button size="sm" variant="subtle" icon={Plus} onClick={onAttach}>เพิ่มให้ผู้ช่วย</Button>
        </div>
      </div>
    </div>
  )
}
