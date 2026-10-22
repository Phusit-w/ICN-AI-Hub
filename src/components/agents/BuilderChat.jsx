import { useRef, useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { cn } from '../../lib/utils'
import MicButton from '../ui/MicButton'

/** The `@name` being typed at the end of `text`, or null. */
const typedMention = (text) => text.match(/(?:^|\s)@([^@\n]*)$/)?.[1] ?? null

/**
 * The chat side of the Agent builder. Messages live only here: the builder chat is not a Thread and never reaches
 * the chat history (spec story 37). Typing @ lists Agents to call in (the demo lists all Agents, spec Out of Scope);
 * ↑/↓ move, Enter or Tab picks, Escape closes. Enter sends otherwise.
 */
export default function BuilderChat({ messages, onSend, initialText = '' }) {
  const { state } = useStore()
  const [text, setText] = useState(initialText)
  const [active, setActive] = useState(0)
  const [dismissedText, setDismissedText] = useState(null) // the text when Escape closed the @ list
  const box = useRef(null)

  const query = text === dismissedText ? null : typedMention(text)
  const options = query === null ? [] : state.agents
    .filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.name.toLowerCase().startsWith(query.toLowerCase()) - a.name.toLowerCase().startsWith(query.toLowerCase()))
  const activeIndex = Math.min(active, options.length - 1)

  const edit = (value) => { setText(value); setActive(0) }
  const pick = (agent) => edit(`${text.slice(0, text.length - query.length)}${agent.name} `)
  const send = () => {
    if (!text.trim()) return
    onSend(text.trim())
    edit('')
  }
  const onKeyDown = (e) => {
    if (options.length > 0) {
      const move = { ArrowDown: activeIndex + 1, ArrowUp: activeIndex - 1 + options.length }[e.key]
      if (move !== undefined) { e.preventDefault(); setActive(move % options.length); return }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(options[activeIndex]); return }
      if (e.key === 'Escape') { e.preventDefault(); setDismissedText(text); return }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <section aria-label="คุยกับ AI" className="flex min-h-[28rem] flex-col rounded-2xl border border-slate-200 bg-white lg:h-[calc(100vh-11rem)]">
      <ol className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <li key={i} className={cn('flex gap-2', m.from === 'user' && 'justify-end')}>
            {m.from === 'ai' && <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><Sparkles className="size-4" aria-hidden /></span>}
            <p className={cn('max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line', m.from === 'user' ? 'bg-slate-100 text-slate-800' : 'text-slate-700')}>{m.text}</p>
          </li>
        ))}
      </ol>
      <form onSubmit={(e) => { e.preventDefault(); send() }} className="relative m-3 mt-0 flex items-end gap-1 rounded-[24px] border border-slate-300 bg-white p-1.5 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-100">
        {options.length > 0 && (
          <ul role="listbox" aria-label="เรียกผู้ช่วยมาช่วยเขียน" className="absolute bottom-full left-0 z-20 mb-1 max-h-60 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
            {options.map((a, i) => (
              <li
                key={a.id} role="option" aria-selected={i === activeIndex}
                onMouseDown={(e) => e.preventDefault()} onClick={() => { pick(a); box.current?.focus() }} onMouseEnter={() => setActive(i)}
                className={cn('cursor-pointer truncate rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700', i === activeIndex && 'bg-slate-100')}
              >{a.name}</li>
            ))}
          </ul>
        )}
        <textarea
          ref={box} value={text} onChange={(e) => edit(e.target.value)} onKeyDown={onKeyDown} rows={1} aria-label="ข้อความถึง AI"
          placeholder="เล่าว่าอยากได้ผู้ช่วยแบบไหน หรือพิมพ์ @ เรียกผู้ช่วยที่มีอยู่"
          className="block max-h-40 min-h-10 min-w-0 flex-1 resize-none self-center bg-transparent px-2.5 py-2 text-[15px] placeholder:text-slate-400 focus:outline-none [field-sizing:content]"
        />
        <MicButton onText={(said) => edit(text.trim() ? `${text.trimEnd()} ${said}` : said)} />
        {/* Dark, not brand: the page's one primary button is "สร้างผู้ช่วย". */}
        <button type="submit" disabled={!text.trim()} aria-label="ส่ง" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400">
          <ArrowUp className="size-5" />
        </button>
      </form>
    </section>
  )
}
