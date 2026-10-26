import { describe, expect, it } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
import { expectArtifactShown, mainMenu, newChatLink, startJourney } from '../journey'

// The Personal agent (ADR 0002, ticket 01): one per User, shown in the composer in place of "อัตโนมัติ", with a Memory its
// owner can read and change. The User persona has used theirs for a while; the Admin persona meets theirs for the first time.

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))
const pickerButton = () => screen.getByRole('button', { name: 'เลือก Agent' })
const questions = () => screen.queryAllByRole('group', { name: /^คำถามที่/ })
const setValue = (element, value) => fireEvent.change(element, { target: { value } })

describe('The Personal agent: first chat', () => {
  it('invites a new User to set up, asks at most five questions with a guess from their department, and keeps the answers as Memory', async () => {
    const app = startJourney('/', { view: 'admin' })
    await app.click(screen.getByRole('link', { name: 'เริ่มตั้งค่า' }))
    expect(app.url()).toBe('/agent/setup')

    // The IT Administrator is guessed to fix IT problems; one click accepts each guess.
    expect(screen.getByRole('button', { name: /^ใช่ แก้ปัญหาไอทีให้พนักงาน/ })).toBeVisible()
    while (screen.queryByRole('button', { name: /^ใช่/ })) await app.click(screen.getByRole('button', { name: /^ใช่/ }))
    expect(questions().length).toBeLessThanOrEqual(5)

    await app.click(screen.getByRole('link', { name: 'ดูสิ่งที่ Agent รู้เกี่ยวกับคุณ' }))
    expect(screen.getByRole('heading', { name: 'สิ่งที่ Agent รู้เกี่ยวกับคุณ' })).toBeVisible()
    expect(screen.getByText('งานประจำ: แก้ปัญหาไอทีให้พนักงาน')).toBeVisible()

    await app.click(newChatLink())
    expect(screen.queryByRole('link', { name: 'เริ่มตั้งค่า' })).toBeNull()
  })

  it('can be skipped, and the invitation does not come back', async () => {
    const app = startJourney('/', { view: 'admin' })
    await app.click(screen.getByRole('link', { name: 'เริ่มตั้งค่า' }))
    await app.click(screen.getByRole('button', { name: 'ข้ามไปก่อน' }))

    expect(app.url()).toBe('/workspace')
    expect(screen.queryByRole('link', { name: 'เริ่มตั้งค่า' })).toBeNull()
  })

  it('an answer typed instead of the guess is what is kept', async () => {
    const app = startJourney('/agent/setup')
    setValue(screen.getByRole('textbox', { name: 'คำตอบ' }), 'ดูแลลูกค้าภาคอีสาน')
    await app.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }))
    while (screen.queryByRole('button', { name: /^ใช่/ })) await app.click(screen.getByRole('button', { name: /^ใช่/ }))

    await app.click(screen.getByRole('link', { name: 'ดูสิ่งที่ Agent รู้เกี่ยวกับคุณ' }))
    expect(screen.getByText('งานประจำ: ดูแลลูกค้าภาคอีสาน')).toBeVisible()
  })
})

describe('The Personal agent: what it knows', () => {
  it('the owner can change and delete a Memory, and rename the Agent; the new name replaces "อัตโนมัติ" in the composer', async () => {
    const app = startJourney('/agent')
    expect(screen.getByText('ชอบรายงานสั้น ขึ้นต้นด้วยข้อสรุป ไม่เกินหนึ่งหน้า')).toBeVisible()

    await app.click(screen.getByRole('button', { name: /^แก้ความจำ: ชอบรายงานสั้น/ }))
    setValue(screen.getByRole('textbox', { name: 'แก้ความจำ' }), 'ชอบรายงานครึ่งหน้า')
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))
    expect(screen.getByText('ชอบรายงานครึ่งหน้า')).toBeVisible()

    await app.click(screen.getByRole('button', { name: /^ลบความจำ: งานประจำ/ }))
    expect(screen.queryByText(/^งานประจำ:/)).toBeNull()

    setValue(screen.getByRole('textbox', { name: 'ชื่อ Agent ของคุณ' }), 'น้องใจดี')
    await app.click(screen.getByRole('button', { name: 'บันทึกชื่อ' }))
    await app.click(newChatLink())
    expect(pickerButton()).toHaveTextContent('น้องใจดี')
    expect(screen.queryByText('อัตโนมัติ')).toBeNull()
  })

  it('is opened from the profile menu', async () => {
    const app = startJourney()
    await app.click(screen.getByRole('button', { name: /โปรไฟล์และมุมมอง/ }))
    await app.click(screen.getByRole('menuitem', { name: 'Agent ของคุณ' }))
    expect(app.url()).toBe('/agent')
  })

  it('shows under a finished Run only the Memories that bear on that request', async () => {
    const app = startJourney()
    await app.type(app.box('ข้อความ'), 'ทำใบเสนอราคาระบบกล้องวงจรปิดให้ลูกค้า ABC พร้อมรายละเอียด')
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()

    expect(screen.getByText(/^ใช้ความจำ:/)).toHaveTextContent('งานประจำ: ทำ Proposal')
    expect(screen.getByText(/^ใช้ความจำ:/)).not.toHaveTextContent('ชอบรายงานสั้น')
  })

  it('a request that touches none of the Memory says nothing about Memory, and a sensitive one still keeps to the Local AI note', async () => {
    const app = startJourney()
    await app.type(app.box('ข้อความ'), 'สวัสดี ช่วยอะไรได้บ้าง')
    await send(app)
    await app.letRunsFinish()
    expect(screen.queryByText(/^ใช้ความจำ:/)).toBeNull()

    await app.click(newChatLink())
    await app.type(app.box('ข้อความ'), 'สรุปเงินเดือนพนักงานฝ่ายขาย เป็นรายงานสั้น')
    await send(app)
    expect(screen.getByText(/พบข้อมูล/)).toBeVisible()
  })

  it('is private to its owner: it is not an Agent in the library, and an Agent saved from a Run carries none of it', async () => {
    const app = startJourney()
    await app.type(app.box('ข้อความ'), 'สรุปข้อมูลตลาดลูกค้าค้าปลีกในไทย และทำรายงาน')
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
    expectArtifactShown()
    await app.click(screen.getByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' }))
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))

    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    const list = screen.getByRole('list', { name: 'รายการ Agent' })
    expect(within(list).queryByRole('link', { name: 'Agent ของคุณ' })).toBeNull()
    const saved = within(list).getAllByRole('link', { name: /^Agent สรุปข้อมูลตลาดลูกค้า/ })[0]
    await app.click(saved)
    expect(document.body).not.toHaveTextContent('งานประจำ: ทำ Proposal')
    expect(document.body).not.toHaveTextContent('ชอบรายงานสั้น')
  })
})
