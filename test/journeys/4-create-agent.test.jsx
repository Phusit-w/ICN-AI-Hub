import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectWithinBudget, mainMenu, startJourney } from '../journey'

// Journey 4: create an Agent. Budget: ≤ 3 clicks from Home.
// The builder (spec .scratch/agents-only-redesign stories 29–34, 36–37, 39): chat with an AI on one side, the Agent
// form it fills in on the other. Messages are sent with Enter, as in any chat, so typing them is not a click.
describe('Journey 4: create an Agent', () => {
  it('from the AI Agent page, an employee chats once, the AI fills the form, and the Agent is created within 3 clicks', async () => {
    const app = startJourney()

    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    await app.click(screen.getByRole('link', { name: 'สร้างผู้ช่วย' }))
    expect(screen.getByText(/อยากได้ผู้ช่วยแบบไหน/, { selector: 'p' })).toBeVisible()
    await app.type(app.box('ข้อความถึง AI'), 'ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียนเรื่องส่งของช้า{Enter}')

    expect(app.box('ชื่อ')).not.toHaveValue('')
    expect(app.box('คำอธิบาย')).toHaveValue('ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียนเรื่องส่งของช้า')
    expect(app.box('คำสั่ง').value).toContain('ช่วยร่างอีเมลตอบลูกค้า')
    await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))

    expect(app.url()).toMatch(/^\/agents\/(?!new)/)
    expect(screen.getByText(/^สร้าง .+ แล้ว/)).toBeVisible()
    expectWithinBudget(app, 3)
  })

  it('a second message refines the draft instead of starting over', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'ช่วยร่างอีเมลตอบลูกค้าที่ร้องเรียน{Enter}')
    const name = app.box('ชื่อ').value
    await app.type(app.box('ข้อความถึง AI'), 'ห้ามสัญญาวันส่งของถ้ายังไม่ได้ยืนยันกับคลัง{Enter}')

    expect(app.box('ชื่อ')).toHaveValue(name)
    expect(app.box('คำสั่ง').value).toContain('ห้ามสัญญาวันส่งของถ้ายังไม่ได้ยืนยันกับคลัง')
  })

  it('every field stays editable, and "✨ ให้ AI ช่วยเขียน" rewrites the instruction', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'ตอบคำถามเรื่องวันลา{Enter}')

    await app.type(app.box('ชื่อ'), '{Control>}a{/Control}ผู้ช่วยวันลา')
    await app.type(app.box('คำอธิบาย'), '{Control>}a{/Control}ตอบเรื่องวันลาของพนักงาน')
    expect(app.box('ชื่อ')).toHaveValue('ผู้ช่วยวันลา')

    await app.type(app.box('คำสั่ง'), '{Control>}a{/Control}ตอบให้สั้นที่สุด')
    await app.click(screen.getByRole('button', { name: /ให้ AI ช่วยเขียน/ }))
    expect(app.box('คำสั่ง').value).not.toBe('ตอบให้สั้นที่สุด')
    expect(app.box('คำสั่ง').value).toContain('ผู้ช่วยวันลา')
    expect(app.box('คำสั่ง').value).toContain('ตอบให้สั้นที่สุด') // what the user wrote is kept
  })

  it('@ calls an existing Agent to help write; the AI uses it, and it does not become a Step', async () => {
    const app = startJourney()

    await app.click(screen.getByRole('link', { name: /สร้างเองได้/ }))
    await app.type(app.box('ข้อความถึง AI'), 'ตอบคำถามสวัสดิการ ตาม @HR')
    expect(screen.getByRole('option', { name: 'HR Policy Agent' })).toBeVisible()
    await app.type(app.box('ข้อความถึง AI'), '{Enter}{Enter}') // pick the first option, then send
    expect(screen.getByText(/ใช้คำสั่งและความรู้ของ HR Policy Agent/)).toBeVisible()
    expect(app.box('คำสั่ง').value).toContain('HR Policy Agent')
    expect(app.box('คำสั่ง').value).toContain('Employee Handbook') // its knowledge, shown where it can be edited
    expect(screen.getByText('ขั้นตอน (0)')).toBeVisible()
    expect(screen.queryByRole('list', { name: 'ขั้นตอน' })).toBeNull()

    await app.click(screen.getByRole('button', { name: /ให้ AI ช่วยเขียน/ }))
    await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))
    expect(app.url()).toMatch(/^\/agents\/(?!new)/)
    expectWithinBudget(app, 3)
  })

  it('the @ list can be picked with the mouse too', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'ทำ proposal ตาม @Sales')
    await app.click(screen.getByRole('option', { name: 'Sales Proposal Agent' }))
    expect(app.box('ข้อความถึง AI')).toHaveValue('ทำ proposal ตาม @Sales Proposal Agent ')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('the builder chat does not go into the chat history', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'สรุปรายงานประชุมโครงการ{Enter}')
    await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))

    expect(within(screen.getAllByRole('navigation', { name: 'ประวัติแชต' })[0]).queryByText(/สรุปรายงานประชุมโครงการ/)).toBeNull()
  })

  it('links to the detailed setup, which keeps what the AI filled in', async () => {
    const app = startJourney('/agents/new', { view: 'admin' })
    await app.type(app.box('ข้อความถึง AI'), 'ร่างอีเมลตอบลูกค้า{Enter}')
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าแบบละเอียด' }))

    expect(screen.getByRole('navigation', { name: 'ขั้นตอน' })).toBeInTheDocument()
    expect(app.box(/^คำอธิบาย/)).toHaveValue('ร่างอีเมลตอบลูกค้า')
  })
})
