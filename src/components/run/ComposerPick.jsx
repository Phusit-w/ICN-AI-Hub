import { useEffect, useState } from 'react'
import { Bot, ChevronDown, X } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { DEPARTMENTS, deptById, userById } from '../../data/catalog'
import { cn } from '../../lib/utils'

// A pick is what the user chose for a request: { agentId } (with or without Steps), or {} when the system chooses.
// The composer and the "ใช้ซ้ำ" row share it.

const toPick = (agentId) => (agentId ? { agentId } : {})

/** Pick state that follows `agentId` whenever it changes (e.g. from the URL). */
export function usePick(agentId) {
  const [pick, setPick] = useState(() => toPick(agentId))
  useEffect(() => { setPick(toPick(agentId)) }, [agentId])
  return [pick, setPick]
}

/** The pick carried in a URL's `?agent=`. */
export const pickFromParams = (params) => toPick(params.get('agent'))

const pillClass = 'flex h-8 min-w-0 items-center gap-1.5 rounded-full bg-brand-50 pr-1 pl-2.5 text-xs text-brand-700'
const clearClass = 'rounded-full p-1 hover:bg-brand-100'

/**
 * Shows the picked Agent inside a composer, with a one-click clear.
 * `chooseAgent` adds a quiet "อัตโนมัติ" dropdown for picking any Agent when nothing is picked.
 */
export default function ComposerPick({ pick, onChange, chooseAgent = false }) {
  const { state } = useStore()
  const agent = pick.agentId && state.agents.find((a) => a.id === pick.agentId)
  const clear = () => onChange({})
  const myDept = userById(state.userId).dept

  const clearAgent = agent && (
    <button type="button" onClick={clear} aria-label="กลับไปเลือกผู้ช่วยอัตโนมัติ" title="กลับไปเลือกอัตโนมัติ" className={clearClass}><X className="size-3" /></button>
  )
  if (!chooseAgent) {
    return agent ? (
      <span className={pillClass}>
        <Bot className="size-3.5 shrink-0" aria-hidden />
        <span className="max-w-56 truncate">ผู้ช่วย: {agent.name}</span>
        {clearAgent}
      </span>
    ) : null
  }
  return (
    <span className={cn('flex min-w-0 items-center rounded-full', agent && 'bg-brand-50 pr-1')}>
      {/* Quiet pill over a native select: compact when automatic, highlighted once an agent is picked. */}
      <label className={cn(
        'relative flex h-8 min-w-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300',
        agent ? 'text-brand-700' : 'text-slate-500 hover:bg-slate-100',
      )}>
        <Bot className="size-3.5 shrink-0" aria-hidden />
        <span className="max-w-40 truncate">{agent ? agent.name : 'อัตโนมัติ'}</span>
        <ChevronDown className="size-3 shrink-0" aria-hidden />
        <select
          value={pick.agentId ?? ''} onChange={(e) => onChange(toPick(e.target.value))} aria-label="เลือกผู้ช่วย"
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          <option value="">อัตโนมัติ — ระบบเลือกให้ (แนะนำ)</option>
          {/* The user's own department comes first: those are the agents they most likely want. */}
          {[...DEPARTMENTS].sort((a, b) => (b.id === myDept) - (a.id === myDept)).map((d) => {
            const list = state.agents.filter((a) => deptById(a.dept).id === d.id)
            return list.length > 0 && (
              <optgroup key={d.id} label={d.id === myDept ? `แผนกของคุณ · ${d.th}` : d.th}>
                {list.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </optgroup>
            )
          })}
        </select>
      </label>
      {clearAgent}
    </span>
  )
}
