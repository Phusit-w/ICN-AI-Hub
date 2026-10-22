import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { mainMenu, startJourney } from '../journey'

// Ticket 04: "Agent ที่มีประโยชน์ที่สุดเดือนนี้" replaces the people leaderboard (spec stories 21, 22, 43, 44).
const TAB = 'Agent ที่มีประโยชน์ที่สุดเดือนนี้'

async function openTab(app) {
  await app.click(screen.getByRole('tab', { name: TAB }))
  return screen.getByRole('tabpanel', { name: TAB })
}
const rows = (panel) => within(within(panel).getByRole('list', { name: TAB })).getAllByRole('listitem')
const rowFor = (panel, name) => rows(panel).find((r) => within(r).queryByText(name))
const reasonsButton = (row) => within(row).getByRole('button', { name: /เหตุผล/ })

describe('Governance: the most useful Agents this month', () => {
  it('ranks Agents by Feedback, each with its department and helpful %, and ranks no people', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    expect(screen.queryByRole('tab', { name: 'ผู้มีส่วนร่วม' })).toBeNull()

    const panel = await openTab(app)
    const top = rows(panel)
    expect(top.map((r) => within(r).getByRole('link').textContent)).toEqual([
      'SOC Check Agent', 'Sales Proposal Agent', 'Progress Report Agent', 'Project Meeting Agent', 'HR Policy Agent',
    ])
    expect(top[0]).toHaveTextContent('Bid Prep')
    expect(top[0]).toHaveTextContent('มีประโยชน์ 95% จาก 43 ครั้ง')
    expect(top[1]).toHaveTextContent('Sales & Marketing')
    // Who made them is not shown: no person ranking.
    expect(within(panel).queryByText(/somlaew.b|Ploy|Thanawat|Wichai|Arisa/)).toBeNull()
  })

  it('an Agent in the list opens its page', async () => {
    const app = startJourney('/governance', { view: 'admin' })
    const panel = await openTab(app)
    await app.click(within(rowFor(panel, 'SOC Check Agent')).getByRole('link'))
    expect(app.url()).toBe('/agents/agent-soc-check')
  })

  it("the Admin reads the reasons people gave with 👎 for an Agent", async () => {
    const app = startJourney('/governance', { view: 'admin' })
    const panel = await openTab(app)
    const row = rowFor(panel, 'SOC Check Agent')
    expect(reasonsButton(row)).toHaveAttribute('aria-expanded', 'false')

    await app.click(reasonsButton(row))

    expect(reasonsButton(row)).toHaveAttribute('aria-expanded', 'true')
    expect(within(row).getByRole('list', { name: /เหตุผล/ })).toHaveTextContent('ไม่ได้ตรวจหัวข้อ SOC ภาคผนวก')
  })

  it('a reason given with 👎 on an Artifact shows up for that Agent', async () => {
    const app = startJourney('/workspace?agent=agent-soc-check', { view: 'admin' })
    await app.type(app.box('ข้อความ'), 'ตรวจ SOC ของ TOR โครงการกล้อง CCTV เทศบาล ว่าเราผ่านทุกข้อไหม')
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))
    await app.letRunsFinish()
    const actions = screen.getAllByRole('group', { name: 'การทำงานกับผลงาน' }).at(-1)
    await app.click(within(actions).getByRole('button', { name: 'ไม่มีประโยชน์' }))
    await app.type(app.box('เหตุผล (ไม่บังคับ)'), 'ลืมข้อกำหนดเรื่องการรับประกัน')
    await app.click(screen.getByRole('button', { name: 'ส่งเหตุผล' }))

    await app.click(within(mainMenu()).getByRole('link', { name: /ภาพรวม/ }))
    const panel = await openTab(app)
    const row = rowFor(panel, 'SOC Check Agent')
    expect(row).toHaveTextContent('มีประโยชน์ 93% จาก 44 ครั้ง')
    await app.click(reasonsButton(row))
    expect(within(row).getByRole('list', { name: /เหตุผล/ })).toHaveTextContent('ลืมข้อกำหนดเรื่องการรับประกัน')
  })
})
