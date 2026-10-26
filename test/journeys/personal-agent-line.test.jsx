import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { newChatLink, startJourney } from '../journey'

// Personal agent, ticket 05: the company's LINE bot, simulated in the app. A User links their LINE with a code, then talks to
// their Personal agent privately, or in a group when called with @.

const WORK = 'สรุปข้อมูลตลาดลูกค้าค้าปลีกในไทย และทำรายงาน'
const phone = () => within(screen.getByRole('region', { name: 'หน้าจอ LINE (จำลอง)' }))
const chat = () => within(phone().getByRole('log'))

async function say(app, text) {
  await app.type(phone().getByRole('textbox', { name: 'พิมพ์ใน LINE' }), text)
  await app.click(phone().getByRole('button', { name: 'ส่งใน LINE' }))
}
async function linkAccount(app) {
  await app.click(screen.getByRole('button', { name: 'รับรหัสผูกบัญชี' }))
  await say(app, screen.getByLabelText('รหัสผูกบัญชี').textContent)
}
const openGroup = (app) => app.click(phone().getByRole('tab', { name: /กลุ่ม/ }))

describe('LINE bot (simulated)', () => {
  it('someone not linked gets how to link; the code links them; then the Personal agent answers and sends only a short summary with a link', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await say(app, 'สวัสดี')
    expect(chat().getByText(/ยังไม่ได้ผูกบัญชี/)).toBeVisible()
    expect(app.store.state.runs.some((r) => r.line)).toBe(false)

    await linkAccount(app)
    expect(chat().getByText(/ผูกบัญชีเรียบร้อยแล้ว/)).toBeVisible()
    expect(screen.getByText('ผูกบัญชี LINE แล้ว')).toBeVisible()

    await say(app, WORK)
    expect(chat().getByText(/รับงานแล้ว/)).toBeVisible()
    await app.letRunsFinish()
    expect(chat().getByText(/เสร็จแล้ว \(\d ขั้นตอน\) ดูผลและดาวน์โหลดไฟล์ในแอป/)).toBeVisible()
    const run = app.store.state.runs.find((r) => r.line?.chat === 'private')
    expect(chat().getByRole('link', { name: 'เปิดในแอป' })).toHaveAttribute('href', `/workspace?run=${run.id}`)
    expect(phone().queryByRole('button', { name: /ดาวน์โหลด/ })).toBeNull()

    await app.click(chat().getByRole('link', { name: 'เปิดในแอป' }))
    expect(app.url()).toBe(`/workspace?run=${run.id}`)
  })

  it('a code that has run out, or is wrong, does not link', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await app.click(screen.getByRole('button', { name: 'รับรหัสผูกบัญชี' }))
    const code = screen.getByLabelText('รหัสผูกบัญชี').textContent
    await app.advance(6 * 60 * 1000)
    await say(app, code)
    expect(chat().getByText(/ใช้ไม่ได้หรือหมดอายุแล้ว/)).toBeVisible()

    await app.click(screen.getByRole('button', { name: 'ขอรหัสใหม่' }))
    await say(app, '000000')
    expect(chat().getAllByText(/ใช้ไม่ได้หรือหมดอายุแล้ว/)).toHaveLength(2)
    expect(screen.queryByText('ผูกบัญชี LINE แล้ว')).toBeNull()
  })

  describe('in a group', () => {
    async function inGroup() {
      const app = startJourney('/agent/line', { apps: ['line'] })
      await linkAccount(app)
      await openGroup(app)
      await app.click(phone().getByRole('button', { name: 'เชิญบอตเข้ากลุ่ม' }))
      return app
    }

    it('says on joining that it reads only what calls it, and stays quiet on ordinary messages', async () => {
      const app = await inGroup()
      expect(chat().getByText(/อ่านเฉพาะข้อความที่เรียกผม/)).toBeVisible()
      const before = chat().getAllByRole('listitem').length
      await say(app, WORK)
      expect(chat().getAllByRole('listitem')).toHaveLength(before + 1) // only the User's own message
      expect(app.store.state.runs.some((r) => r.line)).toBe(false)
    })

    it('answers when called with @, posting a summary with no content only after the User says yes, and does not use Memory', async () => {
      const app = await inGroup()
      await say(app, `@ICN Assistant ทำ Proposal ให้ลูกค้ารายใหม่`)
      await app.letRunsFinish()
      const run = app.store.state.runs.find((r) => r.line?.chat === 'group')
      expect(run.memoryUsed).toEqual([])
      expect(chat().queryByText(/เสร็จแล้ว/)).toBeNull() // nothing is posted before the yes

      await app.click(screen.getAllByRole('link', { name: 'แชตใหม่' })[0])
      await app.click(screen.getAllByRole('link').find((l) => l.getAttribute('href') === `/workspace?run=${run.id}`))
      const ask = within(screen.getByRole('region', { name: 'ถามก่อนลงมือ' }))
      await app.click(ask.getByRole('button', { name: 'โพสต์' }))
      expect(screen.getByRole('region', { name: 'ผลการลงมือ' })).toHaveTextContent('โพสต์ในกลุ่มแล้ว (จำลอง)')

      await app.click(newChatLink())
      await app.click(screen.getByRole('button', { name: /โปรไฟล์และมุมมอง/ }))
      await app.click(screen.getByRole('menuitem', { name: 'Agent ของคุณ' }))
      await app.click(screen.getByRole('link', { name: 'LINE' }))
      await openGroup(app)
      const posted = chat().getByText(/งานที่ขอเรียกผมไว้เสร็จแล้ว/)
      expect(posted.textContent).not.toMatch(/Proposal|ลูกค้า/)
    })

    it('uses the User’s Memory only when they switch it on for that message', async () => {
      const app = await inGroup()
      await app.click(phone().getByRole('checkbox', { name: 'ใช้ความจำส่วนตัวในข้อความนี้' }))
      await say(app, '@ICN Assistant ทำ Proposal ให้ลูกค้ารายใหม่')
      expect(app.store.state.runs.find((r) => r.line?.chat === 'group').memoryUsed.length).toBeGreaterThan(0)
      expect(phone().getByRole('checkbox', { name: 'ใช้ความจำส่วนตัวในข้อความนี้' })).not.toBeChecked() // for that message only
    })

    it('posts by itself once "ทำเองเลย" is on for LINE groups', async () => {
      const app = startJourney('/agent', { apps: ['line'] })
      await app.click(screen.getByRole('switch', { name: 'ทำเองเลย: โพสต์ในกลุ่ม LINE' }))
      await app.click(screen.getByRole('link', { name: 'LINE' }))
      await linkAccount(app)
      await openGroup(app)
      await app.click(phone().getByRole('button', { name: 'เชิญบอตเข้ากลุ่ม' }))
      await say(app, '@ICN Assistant ทำ Proposal ให้ลูกค้ารายใหม่')
      await app.letRunsFinish() // nobody opens the Run: the bot posts on its own
      expect(chat().getByText(/งานที่ขอเรียกผมไว้เสร็จแล้ว/)).toBeVisible()
    })
  })

  it('a sensitive message is refused and starts no Run', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await linkAccount(app)
    const runs = app.store.state.runs.length
    await say(app, 'ขอดูเงินเดือนของทีมขาย')
    expect(chat().getByText(/กรุณาสั่งงานนี้ในเว็บแอปแทน/)).toBeVisible()
    expect(app.store.state.runs).toHaveLength(runs)
  })

  it('tells the User on LINE when a Run they started in the app finishes, unless they switched that off', async () => {
    const app = startJourney('/agent/line', { apps: ['line'] })
    await linkAccount(app)
    await app.click(newChatLink())
    await app.type(app.box('ข้อความ'), 'สรุปนโยบายวันลา')
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
    expect(app.store.state.line['u-kanya'].private.filter((m) => m.link)).toHaveLength(1)

    app.store.actions.lineNotify(false)
    await app.click(newChatLink())
    await app.type(app.box('ข้อความ'), 'สรุปนโยบายวันลาพักร้อน')
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
    expect(app.store.state.line['u-kanya'].private.filter((m) => m.link)).toHaveLength(1)
  })
})
