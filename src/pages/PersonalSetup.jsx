import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { userById } from '../data/catalog'
import { personalFromSetup, personalOf, setupQuestions } from '../lib/personal'
import Button from '../components/ui/Button'

/**
 * The Personal agent's first chat: a few questions (at most five), each with a guess from the User's department that
 * one click accepts. The answers become the Memory. It can be skipped, and run again from the Memory page.
 */
export default function PersonalSetup() {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const me = userById(state.userId)
  const questions = setupQuestions(me.dept)
  const [answers, setAnswers] = useState({})
  const [text, setText] = useState('')
  const step = Object.keys(answers).length
  const done = step >= questions.length
  const q = questions[step]

  const answer = (value) => {
    const next = { ...answers, [q.id]: value.trim() || q.guess }
    setAnswers(next)
    setText('')
    if (Object.keys(next).length === questions.length) {
      actions.savePersonal({ ...personalFromSetup(me.dept, next, me.id), setup: 'done' })
    }
  }
  const skip = () => {
    if (personalOf(state).setup === 'pending') actions.savePersonal({ setup: 'skipped' }) // skipping a re-run changes nothing
    navigate('/workspace')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">ให้ {personalOf(state).name} รู้จักงานของคุณ</h1>
        <p className="mt-2 text-sm text-slate-500">ตอบสั้นๆ {questions.length} ข้อ ผมเดาคำตอบจากแผนกของคุณไว้ให้แล้ว กดยืนยันหรือพิมพ์แก้ได้</p>
      </header>

      <div role="log" aria-label="คุยตั้งค่า" className="space-y-4">
        {questions.slice(0, step + 1).map((item, i) => (
          <div key={item.id} className="space-y-2">
            <p role="group" aria-label={`คำถามที่ ${i + 1}`} className="max-w-[85%] rounded-2xl rounded-bl-md bg-brand-50 px-4 py-2.5 text-[15px] text-slate-800">{item.ask}</p>
            {answers[item.id] !== undefined && (
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-slate-100 px-4 py-2.5 text-[15px] text-slate-800">{answers[item.id]}</p>
            )}
          </div>
        ))}
        {done && <p className="rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">ตั้งค่าเสร็จแล้ว ดูและแก้ได้ในหน้า “สิ่งที่ Agent รู้เกี่ยวกับคุณ”</p>}
      </div>

      {done ? (
        <Button variant="primary" to="/agent">ดูสิ่งที่ Agent รู้เกี่ยวกับคุณ</Button>
      ) : (
        <div className="space-y-3">
          <Button variant="subtle" onClick={() => answer(q.guess)}>ใช่ {q.guess}</Button>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) answer(text) }}>
            <input
              aria-label="คำตอบ" value={text} onChange={(e) => setText(e.target.value)} placeholder="หรือพิมพ์คำตอบเอง"
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:outline-none"
            />
            <Button type="submit" variant="primary" icon={ArrowUp} aria-label="ส่งคำตอบ" />
          </form>
          <button type="button" onClick={skip} className="text-[13px] text-slate-500 hover:text-brand-700">ข้ามไปก่อน</button>
        </div>
      )}
    </div>
  )
}
