import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// "แชตใหม่" sits above the menu and is the home screen, so the menu itself has 3 items in the Admin view.
// The User view has no governance, so its menu has 2 (see view-switch.test.jsx).
const MENU = ['สายงาน', 'ผู้ช่วย AI', 'ภาพรวมและการกำกับดูแล']
const admin = { view: 'admin' }

/** Menu item names; a live count badge (e.g. "2" running Runs) is not part of the item's name. */
const menuItems = (nav) => within(nav).getAllByRole('link').map((l) => l.getAttribute('aria-label') ?? l.textContent.replace(/\d+$/, ''))

const skillDialog = (name) => screen.getByRole('dialog', { name })

describe('Navigation: new chat plus a three-item menu', () => {
  it('the app opens on new chat: greeting, composer and the reuse row, with "แชตใหม่" marked as the current page', () => {
    const app = startJourney('/')
    expect(app.url()).toBe('/workspace')
    expect(screen.getByRole('heading', { level: 1, name: /วันนี้ให้ช่วยอะไรดี/ })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'ใช้ซ้ำ' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'แชตใหม่' })[0]).toHaveAttribute('aria-current', 'page')
  })

  it('on new chat, an Agent in "ใช้ซ้ำ" is not shown again under "ผู้ช่วยของแผนกคุณ"', () => {
    startJourney('/')
    const names = (region) => within(region).getAllByRole('button').map((b) => b.textContent.replace(/^ผู้ช่วย |^สายงาน /, ''))
    const reuse = names(screen.getByRole('region', { name: 'ใช้ซ้ำ' }))
    const dept = screen.queryByRole('region', { name: /ผู้ช่วยของแผนกคุณ/ })
    if (dept) for (const b of within(dept).getAllByRole('button')) {
      expect(reuse.some((n) => b.textContent.startsWith(n))).toBe(false)
    }
  })

  it('the Agents page recommends only once the user says what the job is', async () => {
    const app = startJourney('/agents')
    expect(screen.queryByRole('heading', { name: 'แนะนำสำหรับงานนี้' })).toBeNull()
    await app.type(screen.getByRole('textbox', { name: /ค้นหาผู้ช่วย/ }), 'VPN')
    expect(screen.getByRole('heading', { name: 'แนะนำสำหรับงานนี้' })).toBeInTheDocument()
  })

  it('the main menu has exactly 3 items, in order, with governance in its own group at the bottom', () => {
    startJourney('/', admin)
    expect(menuItems(mainMenu())).toEqual(MENU)
    const groups = within(mainMenu()).getAllByRole('list')
    expect(within(groups.at(-1)).getAllByRole('link').map((l) => l.textContent)).toEqual(['ภาพรวมและการกำกับดูแล'])
  })

  it('the collapsed icon-only menu shows the same 3 items', async () => {
    const app = startJourney('/', admin)
    await app.click(screen.getByRole('button', { name: 'ย่อแถบเมนู' }))
    expect(within(mainMenu()).getAllByRole('link').map((l) => l.getAttribute('aria-label'))).toEqual(MENU)
  })

  it('the mobile menu shows the same 3 items', async () => {
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
})

describe('Skills live in a tab of the Agents page', () => {
  it('an old Skills link lands on the Skills tab of the Agents page', () => {
    const app = startJourney('/skills')
    expect(app.url()).toBe('/agents?tab=skills')
    expect(screen.getByRole('tab', { name: /ทักษะ/ })).toHaveAttribute('aria-selected', 'true')
    expect(within(screen.getByRole('tabpanel')).getAllByText('Pricing Calculator').length).toBeGreaterThan(0)
  })

  it('an old link to a specific Skill lands on the Skills tab with that Skill open', () => {
    const app = startJourney('/skills?open=skill-pricing')
    expect(app.url()).toBe('/agents?tab=skills&open=skill-pricing')
    expect(screen.getByRole('tab', { name: /ทักษะ/ })).toHaveAttribute('aria-selected', 'true')
    expect(skillDialog('Pricing Calculator')).toBeInTheDocument()
  })

  it('global search results for Skills open in the Skills tab', async () => {
    const app = startJourney()
    await app.type(screen.getByRole('searchbox', { name: 'ค้นหาทั้งระบบ' }), 'Pricing')
    await app.click(screen.getByRole('button', { name: /Pricing Calculator/ }))
    expect(app.url()).toBe('/agents?tab=skills&open=skill-pricing')
    expect(skillDialog('Pricing Calculator')).toBeInTheDocument()
  })

  it('the tab is reflected in the URL and the menu item stays active', async () => {
    const app = startJourney('/agents')
    expect(screen.getByRole('tab', { name: /ผู้ช่วย/ })).toHaveAttribute('aria-selected', 'true')
    await app.click(screen.getByRole('tab', { name: /ทักษะ/ }))
    expect(app.url()).toBe('/agents?tab=skills')
    await app.click(screen.getByRole('tab', { name: /ผู้ช่วย/ }))
    expect(app.url()).toBe('/agents')
  })

  it('the tabs use proper roles and work from the keyboard', async () => {
    const app = startJourney('/agents')
    const agentsTab = screen.getByRole('tab', { name: /ผู้ช่วย/ })
    const skillsTab = screen.getByRole('tab', { name: /ทักษะ/ })
    expect(screen.getByRole('tablist')).toContainElement(agentsTab)
    expect(agentsTab).toHaveAttribute('tabindex', '0')
    expect(skillsTab).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', agentsTab.getAttribute('aria-controls'))
    expect(screen.getByRole('tabpanel', { name: /ผู้ช่วย/ })).toBeInTheDocument()

    await app.type(agentsTab, '{ArrowRight}')
    expect(app.url()).toBe('/agents?tab=skills')
    expect(screen.getByRole('tab', { name: /ทักษะ/ })).toHaveFocus()
    expect(screen.getByRole('tabpanel', { name: /ทักษะ/ })).toBeInTheDocument()

    await app.type(screen.getByRole('tab', { name: /ทักษะ/ }), '{Home}')
    expect(app.url()).toBe('/agents')
    expect(screen.getByRole('tab', { name: /ผู้ช่วย/ })).toHaveFocus()
  })

  it('adding a Skill to several Agents still works from the Skills tab', async () => {
    const app = startJourney('/agents?tab=skills')
    await app.click(screen.getByRole('button', { name: 'Pricing Calculator' }))
    await app.click(within(skillDialog('Pricing Calculator')).getByRole('button', { name: 'เพิ่มให้ผู้ช่วย' }))
    const attach = screen.getByRole('dialog', { name: /เพิ่ม .Pricing Calculator. ให้ Agent/ })
    await app.click(within(attach).getByRole('button', { name: /Research Agent/ }))
    await app.click(within(attach).getByRole('button', { name: /^Document Agent/ }))
    await app.click(within(attach).getByRole('button', { name: /เพิ่มให้ 2 Agents/ }))
    expect(screen.getByText('เพิ่ม Pricing Calculator ให้ 2 Agents แล้ว')).toBeInTheDocument()
    expect(app.url()).toBe('/agents?tab=skills')
  })

  it('creating a Skill starts from the Skills tab', async () => {
    const app = startJourney('/agents?tab=skills')
    await app.click(within(screen.getByRole('tabpanel')).getByRole('link', { name: /สร้างทักษะใหม่/ }))
    expect(app.url()).toBe('/skills/new')
  })

  it('Agent detail links to Skills point to the Skills tab', async () => {
    const app = startJourney('/agents/agent-sales-proposal')
    await app.click(screen.getByRole('link', { name: /Pricing Calculator/ }))
    expect(app.url()).toBe('/agents?tab=skills&open=skill-pricing')
    expect(skillDialog('Pricing Calculator')).toBeInTheDocument()
  })
})
