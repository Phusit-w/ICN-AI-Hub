import { useState } from 'react'
import { Rocket, Settings2, Sparkles } from 'lucide-react'
import { Card } from './Card'
import Button from './Button'
import { cn } from '../../lib/utils'

/**
 * The one-page "describe → AI fills → create" flow for creating a Skill (its page and the dialog in the Agent form's Skill picker).
 * The user describes what they need, `onFill(text)` drafts the form, the caller renders the
 * fields to check as `children`, and the footer offers "ตั้งค่าขั้นสูง" (only when `onAdvanced` is given) and the single create button.
 * Exactly one button is primary at a time: "ให้ AI กรอกให้" until there is a draft, then the create button.
 * Without a `title` it has no page heading, for use inside a dialog that has its own.
 */
export default function QuickCreate({ title, subtitle, describeLabel, placeholder, initial = '', drafted, onFill, createLabel, canCreate, onCreate, onAdvanced, children }) {
  const [text, setText] = useState(initial)
  const fill = () => text.trim() && onFill(text)

  return (
    <div className={title ? 'mx-auto max-w-2xl pt-2 lg:pt-6' : undefined}>
      {title && (
        <>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </>
      )}
      <form onSubmit={(e) => { e.preventDefault(); fill() }} className={cn(title && 'mt-5', 'rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100')}>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)} rows={2} autoFocus={!drafted} aria-label={describeLabel}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fill() } }}
          placeholder={placeholder}
          className="block w-full resize-none bg-transparent px-3 py-2 text-[15px] placeholder:text-slate-400 focus:outline-none"
        />
        <div className="flex justify-end px-1">
          <Button type="submit" variant={drafted ? 'secondary' : 'primary'} size="sm" icon={Sparkles} disabled={!text.trim()}>{drafted ? 'ให้ AI กรอกใหม่' : 'ให้ AI กรอกให้'}</Button>
        </div>
      </form>

      {drafted && (
        <Card className="rise mt-5 space-y-5 p-5">
          {children}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            {onAdvanced && <Button variant="ghost" size="sm" icon={Settings2} onClick={onAdvanced} className="mr-auto">ตั้งค่าขั้นสูง</Button>}
            <Button variant="primary" icon={Rocket} onClick={onCreate} disabled={!canCreate}>{createLabel}</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
