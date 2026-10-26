import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/AppStore'
import { personalOf } from '../lib/personal'
import { isSensitive } from '../lib/runs'
import { cn } from '../lib/utils'
import Button from '../components/ui/Button'

// The sample files the simulated Office apps have open. Each item is what a User selects: a paragraph, a row of cells or a slide.
const DOCS = {
  Word: { file: 'บันทึกประชุมทีมขาย.docx', pick: 'ย่อหน้า', items: ['ที่ประชุมรับทราบยอดขายไตรมาสสามเติบโตจากไตรมาสก่อน', 'ทีมขายภาคเหนือขอเพิ่มงบจัดงานแสดงสินค้า', 'ฝ่ายการตลาดจะส่งแผนแคมเปญปลายปีภายในสัปดาห์หน้า'] },
  Excel: { file: 'ยอดขายรายเดือน.xlsx', pick: 'ช่วงข้อมูล', items: ['กรกฎาคม | 1.2 ล้านบาท', 'สิงหาคม | 1.4 ล้านบาท', 'กันยายน | 1.9 ล้านบาท', 'ตุลาคม | 1.7 ล้านบาท'] },
  PowerPoint: { file: 'แผนปีหน้า.pptx', pick: 'สไลด์', items: ['สไลด์ 1: เป้าหมายปี 2027', 'สไลด์ 2: ลูกค้ากลุ่มค้าปลีกและโลจิสติกส์', 'สไลด์ 3: งบประมาณและทีม'] },
}

/**
 * The simulated Office Add-in: a side panel next to Word, Excel or PowerPoint with a sample file open. The real one acts with the
 * signed-in Office user's own rights, on the open file only.
 */
export default function AddinPanel() {
  const { state } = useStore()
  const agent = personalOf(state).name
  const [app, setApp] = useState('Excel')
  const [chosen, setChosen] = useState({}) // selected items, by Office app
  const [added, setAdded] = useState({}) // what the Agent put back into each file
  const [note, setNote] = useState('')
  const off = !state.apps.addin
  const doc = DOCS[app]
  const picks = chosen[app] ?? []
  const toggle = (item) => setChosen({ ...chosen, [app]: picks.includes(item) ? picks.filter((x) => x !== item) : [...picks, item] })
  const summarise = () => {
    if (isSensitive(picks.join(' '))) { setNote('ส่วนที่เลือกมีข้อมูลที่ไม่ควรออกจากไฟล์ ไม่ได้ทำให้'); return }
    setNote('')
    setAdded({ ...added, [app]: [...(added[app] ?? []), `สรุป${doc.pick} ${picks.length} รายการ: ${picks.map((p) => p.split(/[|:]/)[0].trim()).join(' · ')}`] })
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Office Add-in</h1>
        <p className="mt-2 text-sm text-slate-500">
          สั่ง {agent} จากแผงข้าง Word, Excel และ PowerPoint หน้านี้เป็นหน้าจำลองกับไฟล์ตัวอย่าง <Link to="/agent" className="font-medium text-brand-700 hover:underline">กลับไป Agent ของคุณ</Link>
        </p>
      </header>
      <div role="tablist" aria-label="โปรแกรม Office" className="flex gap-2">
        {Object.keys(DOCS).map((name) => (
          <button key={name} type="button" role="tab" aria-selected={app === name} onClick={() => { setApp(name); setNote('') }} className={cn('rounded-full px-4 py-1.5 text-sm font-medium', app === name ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{name}</button>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_16rem]">
        <section aria-label={`ไฟล์ ${doc.file} (จำลอง)`} className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-medium text-slate-800">{doc.file}</h2>
          <ul className="space-y-1">
            {doc.items.map((item) => (
              <li key={item}>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={picks.includes(item)} onChange={() => toggle(item)} aria-label={`เลือก: ${item}`} />{item}
                </label>
              </li>
            ))}
          </ul>
          {(added[app] ?? []).length > 0 && (
            <div role="region" aria-label="ผลที่ใส่ในเอกสาร" className="space-y-1 border-t border-slate-100 pt-2">
              {added[app].map((a, i) => <p key={i} className="text-sm text-emerald-800">{a}</p>)}
            </div>
          )}
        </section>
        <aside aria-label="แผง Agent" className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold text-slate-900">{agent}</h2>
          {off && <p role="status" className="text-sm text-amber-800">Admin ปิด Office Add-in ไว้ จึงยังใช้แผงนี้ไม่ได้</p>}
          <p className="text-xs text-slate-500">เลือก{doc.pick}ในไฟล์ แล้วสั่งได้</p>
          <Button variant="primary" disabled={off || picks.length === 0} onClick={summarise}>สรุป</Button>
          {note && <p className="text-sm text-amber-800">{note}</p>}
        </aside>
      </div>
    </div>
  )
}
