import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { AGENTS } from '../data/agents'
import { SKILLS } from '../data/skills'
import { WORKFLOWS } from '../data/workflows'
import { CURRENT_USER_ID } from '../data/catalog'
import { advanceRun, createRun, planRequest, replayRun, startRun } from '../lib/runs'
import { uid } from '../lib/utils'

const TICK_MS = 400
const MIN = 60000

function seedRuns() {
  const ctx = { agents: AGENTS, skills: SKILLS, workflows: WORKFLOWS }
  const seed = (prompt, agoMs, owner = CURRENT_USER_ID, extra = {}) =>
    replayRun(createRun({ prompt, plan: planRequest(prompt, { ...ctx, ...extra }), owner, createdAt: Date.now() - agoMs }), agoMs)
  // Background runs crawl so Home still shows live workflows throughout a demo.
  const background = (run) => ({ ...run, speed: 0.04 })
  return [
    background(seed('ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics', 13000)),
    background(seed('ทำรายงานปิดงบเดือนกันยายน พร้อมกระทบยอด Invoice', 6000, 'u-nok')),
    seed('หาข้อมูลตลาด EV Charger ในไทย วิเคราะห์ตัวเลข และทำรายงานพร้อม Infographic', 90 * MIN, CURRENT_USER_ID, { workflowId: 'wf-market-report' }),
    seed('สรุปนโยบาย Work from Anywhere 2027 ให้ทีมขาย', 5 * 60 * MIN, CURRENT_USER_ID, { agentId: 'agent-hr-policy' }),
    seed('VPN ต่อไม่ได้ทั้งทีม Field Sales ภาคเหนือ', 26 * 60 * MIN, CURRENT_USER_ID),
    seed('วิเคราะห์ยอดขาย Q3 รายภาค และสรุปเป็นรายงาน', 50 * 60 * MIN, CURRENT_USER_ID),
  ]
}

const initialState = () => ({
  userId: CURRENT_USER_ID,
  agents: AGENTS,
  skills: SKILLS,
  workflows: WORKFLOWS,
  runs: seedRuns(),
  favorites: ['agent-sales-proposal', 'agent-research', 'agent-customer-insight'],
  toasts: [],
})

function reducer(state, action) {
  switch (action.type) {
    case 'tick':
      if (!state.runs.some((r) => r.status === 'running')) return state
      return { ...state, runs: state.runs.map((r) => advanceRun(r, action.dt, action.now)) }
    case 'addRun':
      return { ...state, runs: [action.run, ...state.runs] }
    case 'updateRun':
      return { ...state, runs: state.runs.map((r) => (r.id === action.id ? action.update(r) : r)) }
    case 'removeRun':
      return { ...state, runs: state.runs.filter((r) => r.id !== action.id) }
    case 'addAgent':
      return { ...state, agents: [action.agent, ...state.agents] }
    case 'addSkill':
      return { ...state, skills: [action.skill, ...state.skills] }
    case 'attachSkill':
      return {
        ...state,
        agents: state.agents.map((a) =>
          action.agentIds.includes(a.id) && !a.skills.includes(action.skillId) ? { ...a, skills: [...a.skills, action.skillId] } : a),
      }
    case 'saveWorkflow': {
      const exists = state.workflows.some((w) => w.id === action.workflow.id)
      return { ...state, workflows: exists ? state.workflows.map((w) => (w.id === action.workflow.id ? action.workflow : w)) : [...state.workflows, action.workflow] }
    }
    case 'toggleFavorite':
      return { ...state, favorites: state.favorites.includes(action.id) ? state.favorites.filter((f) => f !== action.id) : [...state.favorites, action.id] }
    case 'toast':
      return { ...state, toasts: [...state.toasts, action.toast] }
    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    default:
      throw new Error(`Unknown action ${action.type}`)
  }
}

const StoreContext = createContext(null)

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // One clock drives every running workflow, so progress continues while the user navigates.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick', dt: TICK_MS, now: Date.now() }), TICK_MS)
    return () => clearInterval(id)
  }, [])

  const actions = useMemo(() => {
    const toast = (message, opts = {}) => {
      const t = { id: uid('toast'), message, tone: 'success', ...opts }
      dispatch({ type: 'toast', toast: t })
      // Toasts with a follow-up link stay longer so there's time to click it.
      setTimeout(() => dispatch({ type: 'dismissToast', id: t.id }), t.action ? 7000 : 3800)
    }
    return {
      toast,
      dismissToast: (id) => dispatch({ type: 'dismissToast', id }),
      /** Plan a request without starting it, so the user can review which agents will run. */
      planRun: (prompt, opts, ctx, { threadId, autoStart = false, attachments = [] } = {}) => {
        // `workflowPicked` separates "the user chose this workflow" from the planner matching one by keyword.
        const run = { ...createRun({ prompt, plan: planRequest(prompt, { ...ctx, ...opts }), owner: CURRENT_USER_ID, threadId }), attachments, workflowPicked: Boolean(opts.workflowId) }
        dispatch({ type: 'addRun', run: autoStart ? startRun(run) : run })
        return run.id
      },
      startRun: (id) => dispatch({ type: 'updateRun', id, update: (r) => startRun(r) }),
      /** Shallow-merge `patch` into a run, e.g. to record what it was saved as. */
      annotateRun: (id, patch) => dispatch({ type: 'updateRun', id, update: (r) => ({ ...r, ...patch }) }),
      removeStep: (id, stepId) => dispatch({
        type: 'updateRun', id,
        update: (r) => {
          const steps = r.steps.filter((s) => s.id !== stepId).map((s) => ({ ...s, loopBackTo: null, loopsLeft: 0 }))
          return { ...r, steps }
        },
      }),
      discardRun: (id) => dispatch({ type: 'removeRun', id }),
      addAgent: (agent) => dispatch({ type: 'addAgent', agent }),
      addSkill: (skill) => dispatch({ type: 'addSkill', skill }),
      attachSkill: (skillId, agentIds) => dispatch({ type: 'attachSkill', skillId, agentIds }),
      saveWorkflow: (workflow) => dispatch({ type: 'saveWorkflow', workflow }),
      toggleFavorite: (id) => dispatch({ type: 'toggleFavorite', id }),
    }
  }, [])

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider')
  return ctx
}
