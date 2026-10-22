import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import { expectAgentPicked, expectArtifactShown, mainMenu, startJourney } from '../journey'

// The "ขั้นตอน" section at the end of the Agent form (spec stories 13–16): empty by default, Steps are other Agents
// picked from "＋ เพิ่มขั้นตอน", they can be reordered and removed, and only Agents without Steps are offered.
// The User view's one-page form is the main path; the Admin's detailed form keeps the Steps chosen there.

const NAME = 'ผู้ช่วยทำรายงานตลาดพร้อมภาพ'

/** The new Agent's Steps, as the form lists them, in order. */
const stepNames = () => within(screen.getByRole('list', { name: 'ขั้นตอน' })).getAllByRole('listitem')
  .map((li) => within(li).getByText(/Agent$/).textContent)

async function draftAgent(app) {
  await app.type(app.box('อยากได้ผู้ช่วยแบบไหน'), 'ค้นข้อมูลตลาด สรุปเป็นรายงาน และทำภาพประกอบ')
  await app.click(screen.getByRole('button', { name: 'ให้ AI กรอกให้' }))
  const name = screen.getByRole('textbox', { name: 'ชื่อ' })
  await app.type(name, '{Control>}a{/Control}' + NAME)
}

async function addStep(app, agentName) {
  await app.click(screen.getByRole('button', { name: 'เพิ่มขั้นตอน' }))
  await app.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: agentName }))
}

/** A new Agent with Research → Document → Image Steps, created from the form. */
async function createAgentWithSteps(app) {
  await draftAgent(app)
  for (const name of ['Image Agent', 'Research Agent', 'Document Agent']) await addStep(app, name)
  await app.click(screen.getByRole('button', { name: 'เลื่อน Image Agent ลง' })) // Research, Image, Document
  await app.click(screen.getByRole('button', { name: 'เลื่อน Document Agent ขึ้น' })) // Research, Document, Image
  await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))
}

describe('The "ขั้นตอน" section of the Agent form', () => {
  it('starts empty, with "＋ เพิ่มขั้นตอน"', async () => {
    const app = startJourney('/agents/new')

    await draftAgent(app)

    expect(screen.queryByRole('list', { name: 'ขั้นตอน' })).toBeNull()
    expect(screen.getByRole('button', { name: 'เพิ่มขั้นตอน' })).toBeVisible()
  })

  it('adds, reorders and removes Steps, and the new Agent shows the right Step count', async () => {
    const app = startJourney('/agents/new')
    await draftAgent(app)

    for (const name of ['Research Agent', 'Image Agent', 'Document Agent']) await addStep(app, name)
    expect(stepNames()).toEqual(['Research Agent', 'Image Agent', 'Document Agent'])
    await app.click(screen.getByRole('button', { name: 'เลื่อน Document Agent ขึ้น' }))
    expect(stepNames()).toEqual(['Research Agent', 'Document Agent', 'Image Agent'])
    await app.click(screen.getByRole('button', { name: 'เอา Image Agent ออก' }))
    expect(stepNames()).toEqual(['Research Agent', 'Document Agent'])
    await app.click(screen.getByRole('button', { name: 'สร้างผู้ช่วย' }))
    await app.click(within(mainMenu()).getByRole('link', { name: /ผู้ช่วย AI/ }))

    expect(screen.getAllByRole('link', { name: NAME })[0].closest('li')).toHaveTextContent('2 ขั้นตอน')
  })

  it('offers only Agents without Steps of their own', async () => {
    const app = startJourney('/agents/new')
    await draftAgent(app)

    await app.click(screen.getByRole('button', { name: 'เพิ่มขั้นตอน' }))

    const offered = within(screen.getByRole('menu')).getAllByRole('menuitem').map((i) => i.textContent)
    expect(offered).toEqual(expect.arrayContaining(['Research Agent', 'Document Agent', 'Review Agent']))
    for (const withSteps of ['Market Research Report', 'Sales Proposal Pipeline', 'IT Incident Triage']) expect(offered).not.toContain(withSteps)
  })

  it('Steps chosen before "ตั้งค่าขั้นสูง" are still there in the Admin’s detailed form', async () => {
    const app = startJourney('/agents/new', { view: 'admin' })
    await draftAgent(app)
    await addStep(app, 'Research Agent')
    await addStep(app, 'Document Agent')

    await app.click(screen.getByRole('button', { name: 'ตั้งค่าขั้นสูง' }))
    await app.click(screen.getByRole('button', { name: /การแชร์ & ขั้นตอน/ }))

    expect(stepNames()).toEqual(['Research Agent', 'Document Agent'])
  })

  it('the new Agent runs its Steps in order straight away and ends with an Artifact', async () => {
    const app = startJourney('/agents/new')
    await createAgentWithSteps(app)

    await app.click(screen.getByRole('link', { name: 'ใช้งาน' }))
    expectAgentPicked(NAME)
    await app.type(app.box('ข้อความ'), 'ตลาดหุ่นยนต์ทำความสะอาดในไทย')
    await app.click(screen.getByRole('button', { name: 'ส่ง' }))

    expect(screen.queryByRole('button', { name: 'เริ่มเลย' })).toBeNull()
    await app.letRunsFinish()
    expectArtifactShown()
    await app.click(screen.getByRole('button', { name: 'ตัวเลือกเพิ่มเติม' }))
    await app.click(screen.getByRole('menuitem', { name: 'ดูขั้นตอน' }))
    const panel = screen.getByRole('complementary', { name: 'ขั้นตอนการทำงาน' })
    const ran = within(panel).getAllByText(/^(Research|Document|Image) Agent$/).map((el) => el.textContent)
    expect([...new Set(ran)]).toEqual(['Research Agent', 'Document Agent', 'Image Agent'])
  })
})
