import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { useStore } from '../store/AppStore'
import { BOT_NAME, GROUP_NAME, MENTION, lineOf } from '../lib/line'
import { cn } from '../lib/utils'
import Button from '../components/ui/Button'
import { Toggle } from '../components/ui/Form'

const CHATS = [['private', BOT_NAME], ['group', `กลุ่ม ${GROUP_NAME}`]]

function Bubble({ message }) {
  const mine = message.from === 'me'
  return (
    <li className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
      <p className={cn('max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-line', mine ? 'bg-emerald-200 text-slate-900' : 'bg-white text-slate-800 shadow-xs')}>{message.text}</p>
      {message.link && <Link to={message.link} className="text-xs font-medium text-emerald-800 hover:underline">เปิดในแอป</Link>}
    </li>
  )
}

/** A phone showing the company's LINE bot (simulated): the User's private chat with it, and a group it can be invited to. */
function Phone() {
  const { state, actions } = useStore()
  const line = lineOf(state)
  const [chat, setChat] = useState('private')
  const [text, setText] = useState('')
  const [useMemory, setUseMemory] = useState(false)
  const send = () => {
    if (!text.trim()) return
    actions.lineSend(chat, text.trim(), state, { useMemory: chat === 'private' || useMemory })
    setText('')
    setUseMemory(false)
  }
  const group = chat === 'group'
  const off = !state.apps.line
  return (
    <section aria-label="หน้าจอ LINE (จำลอง)" className="flex h-[32rem] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-4 border-slate-800 bg-emerald-50 shadow-md">
      <div role="tablist" aria-label="แชต LINE" className="flex shrink-0 bg-emerald-700 text-sm text-white">
        {CHATS.map(([id, name]) => (
          <button key={id} type="button" role="tab" aria-selected={chat === id} onClick={() => setChat(id)} className={cn('flex-1 px-3 py-3 font-medium', chat === id ? 'bg-emerald-800' : 'opacity-80 hover:bg-emerald-600')}>{name}</button>
        ))}
      </div>
      {off && <p role="status" className="shrink-0 bg-amber-100 px-3 py-2 text-xs text-amber-900">Admin ปิด LINE ไว้ บอตจึงยังไม่ตอบ</p>}
      <ul role="log" aria-label={group ? `แชตกลุ่ม ${GROUP_NAME}` : `แชตกับ ${BOT_NAME}`} className="flex-1 space-y-2 overflow-y-auto p-3">
        {line[chat].map((m) => <Bubble key={m.id} message={m} />)}
        {group && !line.botInGroup && (
          <li className="flex justify-center"><Button size="sm" onClick={actions.lineInviteBot}>เชิญบอตเข้ากลุ่ม</Button></li>
        )}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); send() }} className="shrink-0 space-y-1.5 border-t border-emerald-100 bg-white p-2">
        {group && line.botInGroup && (
          <div className="flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={useMemory} onChange={(e) => setUseMemory(e.target.checked)} />ใช้ความจำส่วนตัวในข้อความนี้</label>
            <button type="button" className="font-medium text-emerald-800 hover:underline" onClick={() => setText((t) => `${MENTION} ${t}`)}>เรียกบอตด้วย @</button>
          </div>
        )}
        <div className="flex gap-2">
          <input aria-label="พิมพ์ใน LINE" disabled={off} value={text} onChange={(e) => setText(e.target.value)} className="h-9 min-w-0 flex-1 rounded-full border border-slate-200 px-3 text-sm focus:outline-none" />
          <button type="submit" aria-label="ส่งใน LINE" disabled={off || !text.trim()} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white disabled:bg-slate-200"><Send className="size-4" /></button>
        </div>
      </form>
    </section>
  )
}

/** "LINE": link the User's LINE with a code, choose whether it announces finished Runs, and try the bot on a simulated phone. */
export default function LineSimulator() {
  const { state, actions } = useStore()
  const line = lineOf(state)
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">LINE</h1>
        <p className="mt-2 text-sm text-slate-500">
          สั่งงาน {BOT_NAME} ทาง LINE ได้เหมือนพิมพ์ในแอป หน้านี้เป็นหน้าจอจำลอง ยังไม่ได้ต่อ LINE จริง <Link to="/agent" className="font-medium text-brand-700 hover:underline">กลับไป Agent ของคุณ</Link>
        </p>
      </header>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <section aria-label="ผูกบัญชี" className="space-y-2">
            <h2 className="text-sm font-medium text-slate-800">ผูกบัญชี</h2>
            {line.linked ? (
              <p className="text-sm text-emerald-700">ผูกบัญชี LINE แล้ว</p>
            ) : (
              <>
                <p className="text-sm text-slate-500">รับรหัส 6 หลัก แล้วพิมพ์ส่งหา {BOT_NAME} ในแชตส่วนตัว รหัสใช้ได้ 5 นาที</p>
                {line.code && <p aria-label="รหัสผูกบัญชี" className="font-mono text-2xl tracking-widest text-slate-900">{line.code}</p>}
                <Button variant="primary" onClick={actions.lineCode}>{line.code ? 'ขอรหัสใหม่' : 'รับรหัสผูกบัญชี'}</Button>
              </>
            )}
          </section>
          <section aria-label="แจ้งเตือน" className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-700">
              แจ้งเตือนทาง LINE เมื่องานที่สั่งในแอปเสร็จ
              <Toggle label="แจ้งเตือนทาง LINE" checked={line.notify} onChange={actions.lineNotify} />
            </div>
          </section>
        </div>
        <Phone />
      </div>
    </div>
  )
}
