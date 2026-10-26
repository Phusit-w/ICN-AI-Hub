import { describe, expect, it } from 'vitest'
import { act, screen, within } from '@testing-library/react'
import { mainMenu, newChatLink, startJourney } from '../journey'

// Personal agent, ticket 02: take another User's Agent as your own, and be offered "บันทึกไว้ใช้ซ้ำ" when you ask for the
// same thing again. Nothing is created unless the User presses the button.

const send = (app) => app.click(screen.getByRole('button', { name: 'ส่ง' }))

describe('Taking another User’s Agent', () => {
  it('"รับไปใช้" copies it to me in one click; the owner’s later edit shows as "มีเวอร์ชันใหม่" and changes nothing until I update', async () => {
    const app = startJourney('/agents/agent-it-support')
    await app.click(screen.getByRole('button', { name: 'รับไปใช้' }))

    // I now have my own copy, linked to the original.
    expect(app.url()).toMatch(/^\/agents\/(?!agent-it-support)/)
    expect(screen.getByRole('heading', { name: 'IT Support Agent' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'รับไปใช้' })).toBeNull() // it is mine now
    expect(screen.queryByText(/มีเวอร์ชันใหม่/)).toBeNull()
    const copyUrl = app.url()
    const copy = app.store.state.agents.find((a) => a.forkedFromId === 'agent-it-support')
    expect(copy.owner).toBe(app.store.state.userId)
    expect(copy.share).toBe('private')

    // The owner edits the original and publishes a new version.
    act(() => app.store.actions.updateAgent('agent-it-support', { version: '9.0', instruction: 'คำสั่งใหม่ของเจ้าของ' }))
    await app.click(within(mainMenu()).getByRole('link', { name: /AI Agent/ }))
    await app.click(screen.getAllByRole('link', { name: 'IT Support Agent' }).find((l) => l.getAttribute('href') === copyUrl))
    expect(screen.getByText('มีเวอร์ชันใหม่ v9.0')).toBeVisible()
    expect(document.body).not.toHaveTextContent('คำสั่งใหม่ของเจ้าของ') // my copy still reads as it did

    await app.click(screen.getByRole('button', { name: 'อัปเดตเป็น v9.0' }))
    expect(screen.queryByText(/มีเวอร์ชันใหม่/)).toBeNull()
    expect(document.body).toHaveTextContent('คำสั่งใหม่ของเจ้าของ')
  })

  it('an Agent that is already mine has no "รับไปใช้", and another User’s has', () => {
    startJourney('/agents/agent-customer-insight')
    expect(screen.queryByRole('button', { name: 'รับไปใช้' })).toBeNull()
  })

  it('an Agent with Steps keeps its Steps in the copy', async () => {
    const app = startJourney('/agents/agent-proposal-pipeline')
    await app.click(screen.getByRole('button', { name: 'รับไปใช้' }))

    const copy = app.store.state.agents.find((a) => a.forkedFromId === 'agent-proposal-pipeline')
    expect(copy.steps).toEqual(app.store.state.agents.find((a) => a.id === 'agent-proposal-pipeline').steps)
  })
})

describe('Asking for the same thing again', () => {
  const REQUEST = 'สรุปข้อมูลตลาดลูกค้าค้าปลีกในไทย และทำรายงาน'

  async function ask(app) {
    await app.type(app.box('ข้อความ'), REQUEST)
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
  }

  it('the Personal agent offers "บันทึกไว้ใช้ซ้ำ" on the second ask, and nothing is created until the User presses it', async () => {
    const app = startJourney()
    await ask(app)
    expect(screen.queryByText(/เห็นว่าคุณขอเรื่องนี้มาแล้ว/)).toBeNull() // the first time says nothing

    await app.click(newChatLink())
    await ask(app)
    expect(screen.getByText(/เห็นว่าคุณขอเรื่องนี้มาแล้ว 1 ครั้ง/)).toBeVisible()

    const { agents, skills } = app.store.state // nobody pressed anything: no new Agent or Skill
    expect(agents.some((a) => a.name.startsWith('Agent สรุปข้อมูลตลาด'))).toBe(false)

    await app.click(screen.getAllByRole('button', { name: 'บันทึกไว้ใช้ซ้ำ' }).at(-1))
    await app.click(screen.getByRole('button', { name: 'บันทึก' }))
    expect(app.store.state.agents.filter((a) => a.name.startsWith('Agent สรุปข้อมูลตลาด'))).toHaveLength(1)
    expect(app.store.state.skills).toHaveLength(skills.length) // saving made an Agent, not a Skill
    expect(app.store.state.agents).toHaveLength(agents.length + 1)
    expect(screen.queryByText(/เห็นว่าคุณขอเรื่องนี้มาแล้ว/)).toBeNull() // once saved, no more nudging
  })

  it('a different request is not a repeat', async () => {
    const app = startJourney()
    await ask(app)
    await app.click(newChatLink())
    await app.type(app.box('ข้อความ'), 'หาข้อมูลคู่แข่งรายใหม่ในตลาดกล้องวงจรปิด')
    await send(app)
    await app.click(screen.getByRole('button', { name: 'เริ่มทำงาน' }))
    await app.letRunsFinish()
    expect(screen.queryByText(/เห็นว่าคุณขอเรื่องนี้มาแล้ว/)).toBeNull()
  })
})
