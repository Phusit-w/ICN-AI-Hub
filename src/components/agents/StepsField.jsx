import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { hasSteps } from '../../lib/steps'
import { Field } from '../ui/Form'
import Button from '../ui/Button'
import Menu from '../ui/Menu'
import EntityIcon from './EntityIcon'

/**
 * The Agent form's "ขั้นตอน" section: other Agents the new Agent hands its work to, in order. Empty by default.
 * Only Agents without Steps of their own are offered (GLOSSARY: Step). A Step whose Agent is gone still shows,
 * so it can be removed.
 */
export default function StepsField({ steps, onChange }) {
  const { state } = useStore()
  const offered = state.agents.filter((a) => !hasSteps(a))
  const move = (i, by) => {
    const next = [...steps]
    ;[next[i], next[i + by]] = [next[i + by], next[i]]
    onChange(next)
  }

  return (
    <Field label={`ขั้นตอน (${steps.length})`} hint="ไม่บังคับ — ใส่เมื่องานต้องส่งต่อให้ Agent ตัวอื่นทำทีละขั้น ตามลำดับจากบนลงล่าง">
      {steps.length > 0 && (
        <ol aria-label="ขั้นตอน" className="space-y-2">
          {steps.map((id, i) => {
            const agent = state.agents.find((a) => a.id === id)
            const name = agent?.name ?? 'Agent ในขั้นตอนถูกลบแล้ว'
            return (
              // Steps may repeat an Agent, so a row is its position.
              <li key={`${i}-${id}`} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{i + 1}</span>
                <EntityIcon icon={agent?.kind} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{name}</span>
                <Button size="icon" variant="ghost" icon={ArrowUp} onClick={() => move(i, -1)} disabled={i === 0} aria-label={`เลื่อน ${name} ขึ้น`} />
                <Button size="icon" variant="ghost" icon={ArrowDown} onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label={`เลื่อน ${name} ลง`} />
                <Button size="icon" variant="ghost" icon={X} onClick={() => onChange(steps.filter((_, j) => j !== i))} aria-label={`เอา ${name} ออก`} />
              </li>
            )
          })}
        </ol>
      )}
      {offered.length > 0 && (
        <Menu
          label="เพิ่มขั้นตอน" items={offered.map((a) => ({ label: a.name, onSelect: () => onChange([...steps, a.id]) }))}
          triggerClassName="flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-700 focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:outline-none"
        >
          <Plus className="size-4" /> เพิ่มขั้นตอน
        </Menu>
      )}
    </Field>
  )
}
