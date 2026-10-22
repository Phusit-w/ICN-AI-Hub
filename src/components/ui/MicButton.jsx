import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'
import { cn } from '../../lib/utils'

/** What to tell the user when listening fails; errors not listed (e.g. our own 'aborted') say nothing. */
const PROBLEMS = {
  'not-allowed': 'เบราว์เซอร์ไม่อนุญาตให้ใช้ไมค์',
  'service-not-allowed': 'เบราว์เซอร์ไม่อนุญาตให้ใช้ไมค์',
  'audio-capture': 'ไม่พบไมค์ในเครื่อง',
  'no-speech': 'ไม่ได้ยินเสียง ลองพูดอีกครั้ง',
  network: 'เชื่อมต่อระบบรู้จำเสียงไม่ได้',
}

/** The browser's built-in speech recogniser (Chrome and Edge prefix it), or undefined when there is none. */
const recogniserClass = () => (typeof window === 'undefined' ? undefined : window.SpeechRecognition ?? window.webkitSpeechRecognition)

/**
 * Microphone that turns Thai speech into text: press to listen, press again to stop.
 * Each finished phrase goes to `onText`; a failure (e.g. mic permission refused) is said next to the button.
 * Renders nothing when the browser can't recognise speech.
 */
export default function MicButton({ onText }) {
  const Recognition = recogniserClass()
  const [listening, setListening] = useState(false)
  const [problem, setProblem] = useState('')
  const recogniser = useRef(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(() => () => recogniser.current?.abort(), []) // stop listening when the composer goes away

  if (!Recognition) return null

  const toggle = () => {
    if (listening) {
      recogniser.current?.stop()
      return
    }
    const r = new Recognition()
    r.lang = 'th-TH'
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const said = e.results[i].isFinal && e.results[i][0].transcript.trim()
        if (said) onTextRef.current(said)
      }
    }
    r.onend = () => { setListening(false); recogniser.current = null }
    r.onerror = (e) => setProblem(PROBLEMS[e.error] ?? '')
    recogniser.current = r
    setProblem('')
    r.start()
    setListening(true)
  }

  return (
    <>
      {/* Always mounted so screen readers announce the change. */}
      <span role="status" className={cn('shrink-0 text-xs empty:hidden', listening ? 'font-medium text-brand-600' : 'text-slate-500')}>{listening ? 'กำลังฟัง…' : problem}</span>
      <button
        type="button" onClick={toggle} aria-label="พูดเพื่อพิมพ์" aria-pressed={listening} title={listening ? 'หยุดฟัง' : 'พูดเพื่อพิมพ์'}
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full transition',
          listening ? 'pulse-ring bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        )}
      >
        <Mic className="size-[18px]" aria-hidden />
      </button>
    </>
  )
}
