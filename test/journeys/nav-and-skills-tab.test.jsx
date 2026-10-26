import { describe, expect, it } from 'vitest'
import { cleanup, screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// "แชตใหม่" sits above the menu and is the home screen, so the menu itself has 2 items in the Admin view.
// The User view has no governance, so its menu has 1 (see view-switch.test.jsx). There is no "สายงาน" (ADR 0001).
const MENU = ['AI Agent', 'ภาพรวมและการกำกับดูแล']
const admin = { view: 'admin' }

/** Menu item names; a live count badge (e.g. "2" running Runs) is not part of the item's name. */
const menuItems = (nav) => within(nav).getAllByRole('link').map((l) => l.getAttribute('aria-label') ?? l.textContent.replace(/\d+$/, ''))

const skillDialog = (name) => screen.getByRole('dialog', { name })

describe('Navigation: new chat plus a two-item menu', () => {
  it('the app opens on new chat: a greeting and the composer, no reuse row, with "แชตใหม่" marked as the current page', () => {
    const app = startJourney('/')
    expect(app.url()).toBe('/workspace')
    expect(screen.getByRole('heading', { level: 1, name: /สวัสดี คุณ/ })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'ข้อความ' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'ใช้ซ้ำ' })).toBeNull()
    expect(screen.getAllByRole('link', { name: 'แชตใหม่' })[0]).toHaveAttribute('aria-current', 'page')
  })

  it('the Agents page recommends only once the user says what the job is', async () => {
    const app = startJourney('/agents')
    expect(screen.queryByRole('heading', { name: 'แนะนำสำหรับงานนี้' })).toBeNull()
    await app.type(screen.getByRole('textbox', { name: /ค้นหา Agent/ }), 'VPN')
    expect(screen.getByRole('heading', { name: 'แนะนำสำหรับงานนี้' })).toBeInTheDocument()
  })

  it('the main menu has exactly 2 items, in order, with governance in its own group at the bottom', () => {
    startJourney('/', admin)
    expect(menuItems(mainMenu())).toEqual(MENU)
    const groups = within(mainMenu()).getAllByRole('list')
    expect(within(groups.at(-1)).getAllByRole('link').map((l) => l.textContent)).toEqual(['ภาพรวมและการกำกับดูแล'])
  })

  it('the collapsed icon-only menu shows the same 2 items', async () => {
    const app = startJourney('/', admin)
    await app.click(screen.getByRole('button', { name: 'ย่อแถบเมนู' }))
    expect(within(mainMenu()).getAllByRole('link').map((l) => l.getAttribute('aria-label'))).toEqual(MENU)
  })

  it('the mobile menu shows the same 2 items', async () => {
    const app = startJourney('/', admin)
    await app.click(screen.getByRole('button', { name: 'เปิดเมนู' }))
    const mobile = within(screen.getByRole('dialog')).getByRole('navigation', { name: 'Main' })
    expect(menuItems(mobile)).toEqual(MENU)
  })

  it('the community page is gone: not in the menu, and its old link lands on the Agents page', () => {
    const app = startJourney('/community')
    expect(app.url()).toBe('/agents?filter=popular')
    expect(within(mainMenu()).queryByRole('link', { name: /ชุมชน/ })).toBeNull()
  })

  it('Workflows are gone: no "สายงาน" in the menu, and an old Workflows link lands on the Agents page', () => {
    const app = startJourney('/workflows?id=wf-market-report', admin)
    expect(app.url()).toBe('/agents')
    expect(within(mainMenu()).queryByRole('link', { name: /สายงาน/ })).toBeNull()
  })

  it('an Agent with Steps has a card like any Agent, with a badge saying how many Steps it has', () => {
    startJourney('/agents')
    const name = screen.getAllByRole('link', { name: 'Sales Proposal Pipeline' })[0]
    expect(within(name.closest('li')).getByText('ทีม 5 ขั้นตอน')).toBeVisible()
    expect(within(name.closest('li')).getByRole('link', { name: 'ใช้งาน' })).toHaveAttribute('href', '/workspace?agent=agent-proposal-pipeline')
  })
})

describe('Skills have no page or tab of their own (spec story 40)', () => {
  it('the AI Agent page has no tabs, and "＋ สร้าง Agent" is its main action', () => {
    startJourney('/agents')
    expect(screen.queryByRole('tab')).toBeNull()
    expect(screen.getByRole('link', { name: 'สร้าง Agent' }).className).toContain('bg-brand-600')
  })

  it('an old Skills link lands on the AI Agent page', () => {
    const app = startJourney('/skills')
    expect(app.url()).toBe('/agents')
  })

  it('an old link to a specific Skill, global search and Agent detail open that Skill on the AI Agent page', async () => {
    let app = startJourney('/skills?open=skill-pricing')
    expect(app.url()).toBe('/agents?skill=skill-pricing')
    expect(skillDialog('Pricing Calculator')).toBeInTheDocument()
    cleanup()

    app = startJourney()
    await app.click(screen.getByRole('button', { name: 'ค้นหาทั้งระบบ' }))
    await app.advance(100) // the popup opens a moment after the press
    await app.type(screen.getByRole('combobox', { name: 'ค้นหาทั้งระบบ' }), 'Pricing')
    await app.click(screen.getByRole('option', { name: /Pricing Calculator/ }))
    expect(app.url()).toBe('/agents?skill=skill-pricing')
    cleanup()

    app = startJourney('/agents/agent-sales-proposal')
    await app.click(screen.getByRole('link', { name: /Pricing Calculator/ }))
    expect(skillDialog('Pricing Calculator')).toBeInTheDocument()
    await app.click(within(skillDialog('Pricing Calculator')).getAllByRole('button', { name: 'ปิด' })[0])
    expect(app.url()).toBe('/agents')
  })

  it('adding a Skill to several Agents still works from its detail', async () => {
    const app = startJourney('/agents?skill=skill-pricing')
    await app.click(within(skillDialog('Pricing Calculator')).getByRole('button', { name: 'เพิ่มให้ Agent' }))
    const attach = screen.getByRole('dialog', { name: /เพิ่ม .Pricing Calculator. ให้ Agent/ })
    await app.click(within(attach).getByRole('button', { name: /Research Agent/ }))
    await app.click(within(attach).getByRole('button', { name: /^Document Agent/ }))
    await app.click(within(attach).getByRole('button', { name: /เพิ่มให้ 2 Agents/ }))
    expect(screen.getByText('เพิ่ม Pricing Calculator ให้ 2 Agents แล้ว')).toBeInTheDocument()
  })

  it('Skills are picked in the Agent form, and the new Agent has them', async () => {
    const app = startJourney('/agents/new')
    await app.type(app.box('ข้อความถึง AI'), 'ช่วยทำใบเสนอราคา{Enter}')
    for (const name of [...within(screen.getByText(/^ทักษะ/).parentElement).queryAllByRole('button', { name: /^เอา .+ ออก$/ })]) await app.click(name)
    await app.click(screen.getByRole('button', { name: 'เพิ่มทักษะ' }))
    await app.click(screen.getByRole('menuitem', { name: 'Pricing Calculator' }))
    await app.click(screen.getByRole('button', { name: 'สร้าง Agent' }))

    expect(screen.getAllByRole('link', { name: /Pricing Calculator/ })).toHaveLength(1)
  })
})
