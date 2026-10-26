// Pick an Agent's Cube while building it.
import { Shuffle } from 'lucide-react'
import { cn } from '../../lib/utils'
import Button from '../ui/Button'
import AgentCube from './AgentCube'
import { ACCESSORY_LABELS, CUBE_ACCESSORIES, CUBE_COLORS, CUBE_EYES, CUBE_SHAPES, cubeOf } from '../../lib/cube'

const choice = (on) => cn('h-8 rounded-lg border px-3 text-[13px] transition', on ? 'border-brand-400 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300')

/** `value` is the chosen look, or null while nothing is chosen (the Agent then gets one worked out from its id and `kind`). */
export default function CubeField({ value, onChange, kind }) {
  const current = value ?? cubeOf({ id: 'draft', kind })
  const set = (patch) => onChange({ ...current, ...patch })
  const random = () => {
    const pick = (list) => list[Math.floor(Math.random() * list.length)]
    onChange({ shape: pick(CUBE_SHAPES), eyes: pick(CUBE_EYES), color: pick(CUBE_COLORS), accessory: pick(CUBE_ACCESSORIES) })
  }
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-slate-700">หน้าตา Cube ของ AI Agent</legend>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-3" data-eyt-frame>
        <AgentCube cube={current} size={72} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="รูปทรง">
            {CUBE_SHAPES.map((s) => <button key={s} type="button" aria-pressed={current.shape === s} onClick={() => set({ shape: s })} className={choice(current.shape === s)}>{s}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="สไตล์ตา">
            {CUBE_EYES.map((s) => <button key={s} type="button" aria-pressed={current.eyes === s} onClick={() => set({ eyes: s })} className={choice(current.eyes === s)}>{s}</button>)}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="ของที่ใส่หรือถือ">
            {CUBE_ACCESSORIES.map((s) => <button key={s} type="button" aria-pressed={current.accessory === s} onClick={() => set({ accessory: s })} className={choice(current.accessory === s)}>{ACCESSORY_LABELS[s]}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="สี">
            {CUBE_COLORS.map((c) => (
              <button
                key={c} type="button" aria-pressed={current.color === c} aria-label={`สี ${c}`} onClick={() => set({ color: c })}
                style={{ background: c }} className={cn('size-6 rounded-full ring-offset-2 transition', current.color === c ? 'ring-2 ring-brand-500' : 'hover:ring-2 hover:ring-slate-300')}
              />
            ))}
            <Button size="sm" variant="ghost" icon={Shuffle} onClick={random}>สุ่ม</Button>
          </div>
        </div>
      </div>
      {!value && <p className="text-xs text-slate-400">ยังไม่ได้เลือก ระบบจะให้ Cube ที่ไม่ซ้ำใครตอนสร้าง</p>}
    </fieldset>
  )
}
