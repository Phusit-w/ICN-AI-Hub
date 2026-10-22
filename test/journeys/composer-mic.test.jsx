import { afterEach, describe, expect, it } from 'vitest'
import { act, screen } from '@testing-library/react'
import { startJourney } from '../journey'

// Design A composer (spec stories 44–48): a capsule with attach, text, microphone and send.
// The microphone uses the browser's own speech recognition; jsdom has none, so a fake stands in for Chrome's.

/** The recogniser the page created last, so the test can "speak" into it. */
let recogniser

class FakeSpeechRecognition {
  constructor() { recogniser = this }
  start() { this.started = true }
  stop() { this.started = false; this.onend?.() }
  abort() { this.stop() }
  /** Hear `transcript` as one final result, the way Chrome reports a finished phrase. */
  say(transcript) {
    const result = Object.assign([{ transcript }], { isFinal: true })
    act(() => this.onresult?.({ resultIndex: 0, results: [result] }))
  }
  /** Fail the way Chrome does: an error event, then end. */
  fail(error) {
    act(() => { this.onerror?.({ error }); this.onend?.() })
  }
}

afterEach(() => {
  delete window.webkitSpeechRecognition
  recogniser = undefined
})

describe('The new-chat composer', () => {
  it('has named attach and send buttons and says data follows company policy', () => {
    startJourney()
    expect(screen.getByRole('button', { name: 'แนบไฟล์' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ส่ง' })).toBeInTheDocument()
    expect(screen.getByText('ประมวลผลตามนโยบายองค์กร')).toBeInTheDocument()
  })

  it('hides the microphone when the browser cannot recognise speech', () => {
    startJourney()
    expect(screen.queryByRole('button', { name: 'พูดเพื่อพิมพ์' })).toBeNull()
  })

  it('listens in Thai, appends what was said to the composer, and stops on a second press', async () => {
    window.webkitSpeechRecognition = FakeSpeechRecognition
    const app = startJourney()
    await app.type(app.box('ข้อความ'), 'ช่วย')

    const mic = screen.getByRole('button', { name: 'พูดเพื่อพิมพ์' })
    await app.click(mic)
    expect(recogniser.lang).toBe('th-TH')
    expect(recogniser.started).toBe(true)
    expect(mic).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('กำลังฟัง…')).toBeInTheDocument()

    recogniser.say('สรุป TOR โครงการไฟเบอร์')
    expect(app.box('ข้อความ')).toHaveValue('ช่วย สรุป TOR โครงการไฟเบอร์')

    await app.click(mic)
    expect(recogniser.started).toBe(false)
    expect(mic).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText('กำลังฟัง…')).toBeNull()
  })

  it('says so when the browser refuses the microphone', async () => {
    window.webkitSpeechRecognition = FakeSpeechRecognition
    const app = startJourney()

    await app.click(screen.getByRole('button', { name: 'พูดเพื่อพิมพ์' }))
    recogniser.fail('not-allowed')

    expect(screen.getByRole('status')).toHaveTextContent('เบราว์เซอร์ไม่อนุญาตให้ใช้ไมค์')
    expect(screen.getByRole('button', { name: 'พูดเพื่อพิมพ์' })).toHaveAttribute('aria-pressed', 'false')
  })
})
