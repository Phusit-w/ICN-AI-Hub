import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectAgentPicked, expectArtifactShown, mainMenu, newChatLink, pickAgentFromMenu, startJourney } from '../journey'

// Save for reuse after a Plan (spec stories 26–28): a Run several Agents did becomes one Agent whose Steps
// are the Plan's Agents in order; a Run one Agent did still becomes an Agent without Steps.

/** Open the composer's Agent menu on the new-chat screen, where a saved Agent is listed. */
async function openAgentMenu(app) {
  await app.click(screen.getByRole('button', { name: 'เลือก Agent' }))
  await app.advance(100)
}

// The system plans Research, Document, Image and Review Agents for this request.
const PLAN_REQUEST = 'ช่วยค้นข้อมูลตลาด Solar Rooftop สรุปเป็นรายงาน และสร้างภาพประกอบ'
const SAVED_NAME = /Agent ช่วยค้นข้อมูลตลาด Solar Rooftop/

async function send(app, text) {
  await app.type(app.box('ข้อความ'), text)
  await app.click(screen.getByRole('button', { name: 'ส่ง' }))
}

async function saveForReuse(app) {
  await app.click(screen.getByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' }))
  await app.click(screen.getByRole('button', { name: 'บันทึก' }))
}

async function finishedPlanRun() {
  const app = startJourney()
  await send(app, PLAN_REQUEST)
  await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
  await app.letRunsFinish()
  return app
}

describe('Save for reuse after a multi-Agent Run', () => {
  it('saves one new Agent, listed in the composer menu on new chat', async () => {
    const app = await finishedPlanRun()

    await saveForReuse(app)
    await app.click(newChatLink())
    await openAgentMenu(app)

    expect(screen.getByRole('option', { name: SAVED_NAME })).toBeVisible()
  })

  it('the new Agent with Steps carries its Step badge on the AI Agent page', async () => {
    const app = await finishedPlanRun()

    await saveForReuse(app)
    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))

    const card = screen.getAllByRole('link', { name: SAVED_NAME })[0].closest('li')
    expect(card).toHaveTextContent('4 ขั้นตอน')
  })

  it('reusing the new Agent starts work straight away and ends with an Artifact made by the Plan’s Agents in order', async () => {
    const app = await finishedPlanRun()
    await saveForReuse(app)
    await app.click(newChatLink())

    await pickAgentFromMenu(app, SAVED_NAME)
    expectAgentPicked(SAVED_NAME)
    await send(app, 'ตลาด Solar Rooftop ภาคอีสาน')

    expect(screen.queryByRole('button', { name: 'เริ่มทำงาน' })).not.toBeInTheDocument()
    await app.letRunsFinish()
    expectArtifactShown()
    const steps = screen.getByText(/^ดูขั้นตอนที่ทำ/)
    await app.click(steps)
    expect(steps.closest('details')).toHaveTextContent(/Research.*Document.*Image.*Review/s) // the Steps ran in the Agent's order
  })

  it('offers no separate "save as Workflow" choice', async () => {
    const app = await finishedPlanRun()

    await app.click(screen.getByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' }))

    expect(screen.queryByText(/เวิร์กโฟลว์|สายงาน|Workflow/)).not.toBeInTheDocument()
  })
})

describe('Save for reuse after a one-Agent Run', () => {
  it('still saves an Agent without Steps', async () => {
    const app = startJourney('/workspace?agent=agent-sales-proposal')
    await send(app, 'สรุปจุดขายของระบบ Smart Warehouse สำหรับลูกค้าค้าปลีกรายใหญ่')
    await app.letRunsFinish()

    await saveForReuse(app)
    await app.click(newChatLink())

    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    const card = screen.getAllByRole('link', { name: /Agent สรุปจุดขายของระบบ Smart Warehouse/ })[0].closest('li')
    expect(card).not.toHaveTextContent(/ขั้นตอน/)
  })
})
