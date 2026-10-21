import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { AGENTS } from '../data/agents'
import { SKILLS } from '../data/skills'
import { WORKFLOWS } from '../data/workflows'
import { AUDIT_LOG } from '../data/governance'
import { CURRENT_USER_ID, userById, VIEW_PERSONAS } from '../data/catalog'
import { advanceRun, createRun, planRequest, replayRun, startRun } from '../lib/runs'
import { uid } from '../lib/utils'
import usePersistentState from '../lib/usePersistentState'

const TICK_MS = 400
const MIN = 60000

/** Where the presenter's chosen view is kept, so a reload during a presentation stays in it. */
export const VIEW_STORAGE_KEY = 'icn.view'

/** The one question every page asks about the view: is the presenter looking through the Admin's eyes? */
export const isAdminView = (state) => state.view === 'admin'

/** Whether the Agent, Skill or Workflow `id` is waiting for an Admin to approve sharing it with the whole company. */
export const isAwaitingCompanyShare = (state, kind, id) => state.shareRequests.some((r) => r.kind === kind && r.itemId === id)

// Where each kind of shareable item lives in the state.
const COLLECTIONS = { agent: 'agents', skill: 'skills', workflow: 'workflows' }

/** The Agent, Skill or Workflow a Company sharing request is about (undefined if it no longer exists). */
export const shareRequestItem = (state, req) => state[COLLECTIONS[req.kind]].find((x) => x.id === req.itemId)

function seedRuns() {
  const ctx = { agents: AGENTS, skills: SKILLS, workflows: WORKFLOWS }
  const seed = (prompt, agoMs, owner = CURRENT_USER_ID, extra = {}) =>
    replayRun(createRun({ prompt, plan: planRequest(prompt, { ...ctx, ...extra }), owner, createdAt: Date.now() - agoMs }), agoMs)
  // Background runs crawl so the chat history still shows live work throughout a demo.
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

// Company sharing requests waiting for the Admin when the demo opens: the items stay at department until then.
const seedShareRequests = () => [
  { id: 'req-soc-check', kind: 'agent', itemId: 'agent-soc-check', requester: 'u-ploy', at: Date.now() - 3 * 60 * MIN },
  { id: 'req-month-end', kind: 'workflow', itemId: 'wf-month-end', requester: 'u-nok', at: Date.now() - 26 * 60 * MIN },
]

const clock = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const initialState = () => ({
  agents: AGENTS,
  skills: SKILLS,
  workflows: WORKFLOWS,
  runs: seedRuns(),
  favorites: ['agent-sales-proposal', 'agent-research', 'agent-customer-insight'],
  toasts: [],
  shareRequests: seedShareRequests(),
  // Feedback on Artifacts, keyed by Run: { verdict: 'up' | 'down', reason? }.
  feedback: {},
  auditLog: AUDIT_LOG,
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
    case 'giveFeedback':
      return { ...state, feedback: { ...state.feedback, [action.runId]: action.feedback } }
    case 'requestCompanyShare':
      return { ...state, shareRequests: [...state.shareRequests, action.request] }
    case 'decideShareRequest': {
      const req = state.shareRequests.find((r) => r.id === action.id)
      if (!req) return state
      const key = COLLECTIONS[req.kind]
      const item = shareRequestItem(state, req)
      const entry = {
        id: uid('log'), time: clock(action.now), user: userById(VIEW_PERSONAS.admin).name,
        action: `${action.approve ? 'อนุมัติ' : 'ส่งกลับ'}คำขอแชร์ทั้งบริษัท: ${item?.name ?? req.itemId} ของ ${userById(req.requester).name}`,
        result: action.approve ? 'แชร์ทั้งบริษัทแล้ว' : 'ยังแชร์ในแผนก', tone: action.approve ? 'success' : 'neutral',
      }
      return {
        ...state,
        shareRequests: state.shareRequests.filter((r) => r.id !== req.id),
        auditLog: [entry, ...state.auditLog],
        [key]: action.approve ? state[key].map((x) => (x.id === req.itemId ? { ...x, share: 'company' } : x)) : state[key],
      }
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
  // 'user' | 'admin'. Opens in the User view; anything else in storage counts as the User view.
  const [view, setView] = usePersistentState(VIEW_STORAGE_KEY, 'user')
  const normalView = view === 'admin' ? 'admin' : 'user'
  // Actions are made once, so they read the view through a ref to know who is acting.
  const viewRef = useRef(normalView)
  viewRef.current = normalView

  // One clock drives every running workflow, so progress continues while the user navigates.
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick', dt: TICK_MS, now: Date.now() }), TICK_MS)
    return () => clearInterval(id)
  }, [])

  const actions = useMemo(() => {
    /** Show a toast; `stay: true` keeps it until the user clicks its link or closes it. */
    const toast = (message, { stay = false, ...opts } = {}) => {
      const t = { id: uid('toast'), message, tone: 'success', ...opts }
      dispatch({ type: 'toast', toast: t })
      if (stay) return
      // Toasts with a follow-up link stay longer so there's time to click it.
      setTimeout(() => dispatch({ type: 'dismissToast', id: t.id }), t.action ? 7000 : 3800)
    }
    // A User can't share with the whole company directly: the item stays at department and the Admin gets a
    // Company sharing request. The Admin approves sharing, so the Admin's own items go company-wide at once.
    const holdForAdmin = (kind, item) => {
      if (item.share !== 'company' || viewRef.current === 'admin') return item
      dispatch({ type: 'requestCompanyShare', request: { id: uid('req'), kind, itemId: item.id, requester: item.owner, at: Date.now() } })
      return { ...item, share: 'department' }
    }
    return {
      toast,
      dismissToast: (id) => dispatch({ type: 'dismissToast', id }),
      /**
       * Plan a request; by default it waits so the user can review which agents will run.
       * `autoStart` is a boolean or a predicate on the plan, for callers whose decision depends on what was planned.
       */
      planRun: (prompt, opts, ctx, { threadId, autoStart = false, attachments = [] } = {}) => {
        const plan = planRequest(prompt, { ...ctx, ...opts })
        // `workflowPicked` separates "the user chose this workflow" from the planner matching one by keyword.
        const run = { ...createRun({ prompt, plan, owner: VIEW_PERSONAS[viewRef.current], threadId }), attachments, workflowPicked: Boolean(opts.workflowId) }
        const start = typeof autoStart === 'function' ? autoStart(plan) : autoStart
        dispatch({ type: 'addRun', run: start ? startRun(run) : run })
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
      /** Add an Agent or Skill and return it as stored, so the caller can tell whether sharing it company-wide waits for the Admin. */
      addAgent: (agent) => { const a = holdForAdmin('agent', agent); dispatch({ type: 'addAgent', agent: a }); return a },
      addSkill: (skill) => { const sk = holdForAdmin('skill', skill); dispatch({ type: 'addSkill', skill: sk }); return sk },
      attachSkill: (skillId, agentIds) => dispatch({ type: 'attachSkill', skillId, agentIds }),
      saveWorkflow: (workflow) => dispatch({ type: 'saveWorkflow', workflow }),
      toggleFavorite: (id) => dispatch({ type: 'toggleFavorite', id }),
      /** Record (or change) the user's Feedback on a Run's Artifact; `reason` is optional and only kept with 👎. */
      giveFeedback: (runId, verdict, reason) => dispatch({ type: 'giveFeedback', runId, feedback: reason ? { verdict, reason } : { verdict } }),
      /** The Admin approves (`approve` true) or sends back a Company sharing request; either way it is written to the audit log. */
      decideShareRequest: (id, approve) => dispatch({ type: 'decideShareRequest', id, approve, now: Date.now() }),
      // The first render's setter is enough: it only uses React's stable setter and the fixed storage key.
      setView,
    }
  }, [])

  // Whose eyes the view looks through is also who owns what is made in it.
  const value = useMemo(() => ({ state: { ...state, view: normalView, userId: VIEW_PERSONAS[normalView] }, actions }), [state, normalView, actions])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside AppStoreProvider')
  return ctx
}
