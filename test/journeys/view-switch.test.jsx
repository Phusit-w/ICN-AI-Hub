import { describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Ticket demo-two-views/01: the presenter switches between the User and Admin views from the profile menu.
// The User view hides governance, the "ขั้นสูง" buttons and the model picker, and its routes are guarded too.

const GOVERNANCE = 'ภาพรวมและการกำกับดูแล'
const menuItems = () => within(mainMenu()).getAllByRole('link').map((l) => l.textContent.replace(/\d+$/, ''))
const profile = () => screen.getAllByRole('button', { name: /โปรไฟล์และมุมมอง/ })[0]

async function switchTo(app, view) {
  await app.click(profile())
  await app.click(screen.getByRole('menuitemradio', { name: view === 'admin' ? /Admin/ : /User/ }))
}

describe('Switching between the User and Admin views', () => {
  it('opens in the User view: the current user at the bottom of the sidebar and no governance menu', () => {
    startJourney()
    expect(profile()).toHaveTextContent('Kanya S.')
    expect(profile()).toHaveTextContent('Sales Manager')
    expect(menuItems()).not.toContain(GOVERNANCE)
  })

  it('the profile menu switches to the Admin view: the Admin persona and the governance menu appear', async () => {
    const app = startJourney()
    await switchTo(app, 'admin')
    expect(profile()).toHaveTextContent('Kittipong W.')
    expect(profile()).toHaveTextContent('IT Administrator')
    expect(menuItems()).toContain(GOVERNANCE)
    expect(app.url()).toBe('/workspace')

    await switchTo(app, 'user')
    expect(profile()).toHaveTextContent('Kanya S.')
    expect(menuItems()).not.toContain(GOVERNANCE)
  })

  it('the profile menu marks the current view', async () => {
    const app = startJourney()
    await app.click(profile())
    expect(screen.getByRole('menuitemradio', { name: /User/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('menuitemradio', { name: /Admin/ })).toHaveAttribute('aria-checked', 'false')
  })

  it('the chosen view survives a reload', async () => {
    const app = startJourney()
    await switchTo(app, 'admin')
    cleanup()
    startJourney()
    expect(profile()).toHaveTextContent('Kittipong W.')
    expect(menuItems()).toContain(GOVERNANCE)
  })

  it('switching to User while on governance lands on new chat', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    await switchTo(app, 'user')
    expect(app.url()).toBe('/workspace')
  })

  it('switching view elsewhere keeps the page', async () => {
    const app = startJourney('/agents/agent-it-support')
    await switchTo(app, 'admin')
    expect(app.url()).toBe('/agents/agent-it-support')
    await switchTo(app, 'user')
    expect(app.url()).toBe('/agents/agent-it-support')
  })
})

describe('The User view', () => {
  it('a direct governance link lands on new chat', () => {
    const app = startJourney('/governance')
    expect(app.url()).toBe('/workspace')
  })

  it('a detailed-builder link lands on the simple editor for that Workflow, without "ขั้นสูง"', () => {
    const app = startJourney('/workflows?id=wf-market-report&advanced=1')
    expect(app.url()).toBe('/workflows?id=wf-market-report')
    expect(screen.getByRole('textbox', { name: 'ชื่อสายงาน' })).toHaveValue('Market Research Report')
    expect(screen.queryByRole('button', { name: 'ทดลองรัน' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'ขั้นสูง' })).toBeNull()
  })

  it('a Workflow with conditions does not open the detailed builder; it can still be used', () => {
    startJourney('/workflows?id=wf-sales-proposal')
    expect(screen.queryByRole('button', { name: 'ทดลองรัน' })).toBeNull()
    expect(screen.getByRole('link', { name: 'ใช้งาน' })).toBeInTheDocument()
  })

  it('a new AI Workflow draft has no "ขั้นสูง"', async () => {
    const app = startJourney('/workflows')
    await app.type(app.box('อยากให้สายงานทำอะไร'), 'ค้นข้อมูลคู่แข่ง สรุปเป็นเอกสาร{Enter}')
    expect(screen.getByRole('button', { name: 'บันทึก' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ขั้นสูง' })).toBeNull()
  })

  it('the step-by-step Agent link falls back to quick create, without "ตั้งค่าขั้นสูง"', async () => {
    const app = startJourney('/agents/new?advanced=1')
    await app.type(app.box('อยากได้ผู้ช่วยแบบไหน'), 'ร่างอีเมลตอบลูกค้า')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expect(screen.getByRole('button', { name: 'สร้างผู้ช่วย' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ตั้งค่าขั้นสูง' })).toBeNull()
    expect(screen.queryByRole('navigation', { name: 'ขั้นตอน' })).toBeNull()
  })

  it('the full Skill form link falls back to quick create, without "ตั้งค่าขั้นสูง"', async () => {
    const app = startJourney('/skills/new?advanced=1')
    await app.type(app.box('อยากได้ทักษะแบบไหน'), 'ตรวจคำผิดในเอกสาร')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    expect(screen.getByRole('button', { name: 'สร้างทักษะ' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'ตั้งค่าขั้นสูง' })).toBeNull()
    expect(screen.queryByRole('textbox', { name: /^Instruction/ })).toBeNull()
  })

  it('copying an Agent opens quick create filled in from it', () => {
    startJourney('/agents/new?from=agent-it-support')
    expect(screen.queryByRole('navigation', { name: 'ขั้นตอน' })).toBeNull()
    expect(screen.getByRole('textbox', { name: 'ชื่อ' })).toHaveValue('IT Support Agent (Copy)')
    expect(screen.getByRole('button', { name: 'สร้างผู้ช่วย' })).toBeInTheDocument()
  })

  it('has no model picker, and the composer still says data follows company policy', async () => {
    const app = startJourney('/agents')
    await app.click(screen.getByRole('button', { name: /ตัวกรอง/ }))
    expect(screen.getByRole('combobox', { name: 'เรียงตาม' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'ประเภท Model' })).toBeNull()

    await app.click(screen.getAllByRole('link', { name: 'แชตใหม่' })[0])
    expect(screen.getByText('ประมวลผลตามนโยบายองค์กร')).toBeInTheDocument()
  })
})

describe('The Admin view', () => {
  it('sees the governance page', () => {
    const app = startJourney('/governance', { view: 'admin' })
    expect(app.url()).toBe('/governance')
    expect(screen.getByRole('region', { name: 'ตัวเลขสำคัญ' })).toBeInTheDocument()
  })

  it('sees "ขั้นสูง" in the Workflow editor and opens the detailed builder', async () => {
    const app = startJourney('/workflows?id=wf-market-report', { view: 'admin' })
    await app.click(screen.getByRole('button', { name: 'ขั้นสูง' }))
    expect(screen.getByRole('button', { name: 'ทดลองรัน' })).toBeVisible()
  })

  it('sees "ตั้งค่าขั้นสูง" in quick create and opens the step-by-step Agent form', async () => {
    const app = startJourney('/agents/new', { view: 'admin' })
    await app.type(app.box('อยากได้ผู้ช่วยแบบไหน'), 'ร่างอีเมลตอบลูกค้า')
    await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))
    expect(screen.getByRole('navigation', { name: 'ขั้นตอน' })).toBeInTheDocument()
  })

  it('sees the model filter', async () => {
    const app = startJourney('/agents', { view: 'admin' })
    await app.click(screen.getByRole('button', { name: /ตัวกรอง/ }))
    expect(screen.getByRole('combobox', { name: 'ประเภท Model' })).toBeInTheDocument()
  })
})
