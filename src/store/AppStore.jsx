import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { AGENTS } from '../data/agents'
import { SKILLS } from '../data/skills'
import { AUDIT_LOG } from '../data/governance'
import { EXAMPLE_CHATS } from '../data/exampleChats'
import { CURRENT_USER_ID, userById, VIEW_PERSONAS } from '../data/catalog'
import { advanceRun, createRun, planRequest, replayRun, startRun } from '../lib/runs'
import { uid } from '../lib/utils'
import usePersistentState from '../lib/usePersistentState'
import { relevantMemories, seedPersonal } from '../lib/personal'
import { EXCEL_COLUMNS, EXCEL_FILE, OUTWARD, outwardFor } from '../lib/outward'
import { APPS, appById, noApps, OUTWARD_APP } from '../lib/apps'
import { CODE_TTL_MS, GROUP_INTRO, GROUP_NAME, groupSummary, hear, lineOf, newCode, noticeFinished, say, withLine } from '../lib/line'

const TICK_MS = 400
const MIN = 60000

/** Where the presenter's chosen view is kept, so a reload during a presentation stays in it. */
export const VIEW_STORAGE_KEY = 'icn.view'

/** The one question every page asks about the view: is the presenter looking through the Admin's eyes? */
export const isAdminView = (state) => state.view === 'admin'

/** Whether the Agent or Skill `id` is waiting for an Admin to approve sharing it with the whole company. */
export const isAwaitingCompanyShare = (state, kind, id) => state.shareRequests.some((r) => r.kind === kind && r.itemId === id)

// Where each kind of shareable item lives in the state.
const COLLECTIONS = { agent: 'agents', skill: 'skills' }

/** The Agent or Skill a Company sharing request is about (undefined if it no longer exists). */
export const shareRequestItem = (state, req) => state[COLLECTIONS[req.kind]].find((x) => x.id === req.itemId)

function seedRuns() {
  const ctx = { agents: AGENTS }
  const seed = (prompt, agoMs, owner = CURRENT_USER_ID, extra = {}) =>
    replayRun(createRun({ prompt, plan: planRequest(prompt, { ...ctx, ...extra }), owner, createdAt: Date.now() - agoMs }), agoMs)
  // Background runs crawl so the chat history still shows live work throughout a demo.
  const background = (run) => ({ ...run, speed: 0.04 })
  // Scripted Threads: finished one-Agent Runs whose Artifacts are written out, not the generic mock.
  const example = ({ agentId, title, runs }) => {
    const planned = planRequest(runs[0].prompt, { ...ctx, agentId })
    const threadId = uid('thread')
    return runs.map(({ prompt, attachments, outputs, ago, scheduleLabel, scheduleSet }) => {
      // One Step per output. An Agent without Steps is planned with a Review after it, which the example leaves out.
      const steps = planned.steps.slice(0, outputs.length)
      const reason = steps.length > 1 ? planned.reason : `ใช้ Agent "${steps[0].name}" ที่คุณเลือก`
      const run = replayRun(createRun({ prompt, plan: { ...planned, steps, reason }, owner: CURRENT_USER_ID, threadId, createdAt: Date.now() - ago }), ago)
      // A Run the Schedule started adds its week to the Office365 file, which waits for the User's yes unless they set it to automatic.
      const outward = scheduleLabel && { type: 'excel', status: 'asking', draft: { file: EXCEL_FILE, columns: EXCEL_COLUMNS, row: ['2026-10-19', title, 'Agent ของคุณ (ตั้งเวลา)'] } }
      return { ...run, title, attachments, scheduleLabel, scheduleSet, outward: outward || undefined, steps: run.steps.map((s, i) => ({ ...s, id: uid('step'), output: outputs[i] })) }
    })
  }
  return [
    ...EXAMPLE_CHATS.flatMap(example),
    background(seed('ทำ Proposal ระบบ Smart Warehouse ให้ลูกค้า Siam Logistics', 13000)),
    background(seed('ทำรายงานปิดงบเดือนกันยายน พร้อมกระทบยอด Invoice', 6000, 'u-nok')),
    seed('หาข้อมูลตลาด EV Charger ในไทย วิเคราะห์ตัวเลข และทำรายงานพร้อม Infographic', 90 * MIN, CURRENT_USER_ID, { agentId: 'agent-market-report' }),
    seed('สรุปนโยบาย Work from Anywhere 2027 ให้ทีมขาย', 5 * 60 * MIN, CURRENT_USER_ID, { agentId: 'agent-hr-policy' }),
    seed('VPN ต่อไม่ได้ทั้งทีม Field Sales ภาคเหนือ', 26 * 60 * MIN, CURRENT_USER_ID),
    seed('วิเคราะห์ยอดขาย Q3 รายภาค และสรุปเป็นรายงาน', 50 * 60 * MIN, CURRENT_USER_ID),
  ]
}

// Company sharing requests waiting for the Admin when the demo opens: the items stay at department until then.
const seedShareRequests = () => [
  { id: 'req-soc-check', kind: 'agent', itemId: 'agent-soc-check', requester: 'u-ploy', at: Date.now() - 3 * 60 * MIN },
  { id: 'req-month-end', kind: 'agent', itemId: 'agent-month-end', requester: 'u-nok', at: Date.now() - 26 * 60 * MIN },
]

const clock = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

const initialState = () => ({
  agents: AGENTS,
  skills: SKILLS,
  runs: seedRuns(),
  favorites: ['agent-sales-proposal', 'agent-research', 'agent-customer-insight'],
  toasts: [],
  shareRequests: seedShareRequests(),
  // Feedback on Artifacts, keyed by Run: { verdict: 'up' | 'down', reason? }.
  feedback: {},
  auditLog: AUDIT_LOG,
  // Each User's Personal agent: { name, setup: 'pending' | 'skipped' | 'done', memories }, keyed by user id.
  personal: seedPersonal(),
  // The Office365 Excel file that Personal agents add rows to (simulated); rows are only ever added at the end.
  // Each User's LINE (simulated): { linked, code, expiresAt, notify, botInGroup, private, group }, keyed by user id.
  line: {},
  // Which apps the Admin has switched on for the whole company, and the accounts closed (their Memory and Connections are gone).
  apps: noApps(),
  closed: [],
  office365: { excel: { file: EXCEL_FILE, columns: EXCEL_COLUMNS, rows: [['2026-10-19', 'สรุปยอดขายสัปดาห์', 'Arisa M.'], ['2026-10-20', 'ตรวจ SOC โครงการ A', 'Ploy K.']] } },
})

/** The User's answer to an Outward action the Run asked about: `decision` 'done' does it (simulated), 'declined' does nothing. */
function resolveOutward(state, action) {
  const run = state.runs.find((r) => r.id === action.runId)
  if (run?.outward?.status !== 'asking' || !state.apps[OUTWARD_APP[run.outward.type]]) return state
  const { type, draft } = run.outward
  const done = action.decision === 'done'
  let next = state
  let rowNo
  if (done && type === 'excel') {
    const rows = [...state.office365.excel.rows, draft.row]
    rowNo = rows.length
    next = { ...next, office365: { ...state.office365, excel: { ...state.office365.excel, rows } } }
  }
  if (done && type === 'line-group') next = withLine(next, run.owner, (l) => ({ ...l, group: [...l.group, say('bot', draft.text)] }))
  const entry = {
    id: uid('log'), time: clock(action.now), user: userById(run.owner).name,
    action: done ? `${OUTWARD[type].label} (จำลอง): ${draft.subject ?? draft.file ?? draft.group}` : `ไม่${OUTWARD[type].label}: ผู้ใช้เลือกไม่ทำ`,
    result: done ? (action.via === 'auto' ? 'ทำเองตามที่ตั้งไว้' : 'ผู้ใช้ยืนยัน') : 'ยกเลิก', tone: done ? 'success' : 'neutral',
  }
  return {
    ...next, auditLog: [entry, ...next.auditLog],
    runs: next.runs.map((r) => (r.id === run.id ? { ...r, outward: { ...r.outward, status: action.decision, via: action.via, rowNo } } : r)),
  }
}

/** A Run that has just finished: tell the User on LINE, and do by itself an Outward action they set to automatic (the Run may be in a LINE chat nobody has the app open for). */
function finishRun(state, run, now) {
  const next = noticeFinished(state, run)
  return run.outward?.status === 'asking' && state.personal[run.owner]?.auto?.[run.outward.type]
    ? resolveOutward(next, { runId: run.id, decision: 'done', via: 'auto', now })
    : next
}

/** `state` with an Admin's action written to the audit log. */
const adminLogged = (state, now, action, result, tone) => ({
  ...state, auditLog: [{ id: uid('log'), time: clock(now), user: userById(VIEW_PERSONAS.admin).name, action, result, tone }, ...state.auditLog],
})

function reducer(state, action) {
  switch (action.type) {
    case 'setApp':
      return adminLogged({ ...state, apps: { ...state.apps, [action.app]: action.on } }, action.now,
        `${action.on ? 'เปิด' : 'ปิด'} ${appById(action.app).label} ทั้งบริษัท`, action.on ? 'เปิดแล้ว' : 'ปิดแล้ว', action.on ? 'success' : 'warning')
    case 'disconnectLine':
      return adminLogged(withLine(state, action.userId, (l) => ({ ...l, linked: false, code: null })), action.now,
        `ตัดการเชื่อม LINE ของ ${userById(action.userId).name}`, 'ต้องผูกใหม่', 'warning')
    case 'closeAccount': {
      const { [action.userId]: _memory, ...personal } = state.personal
      const { [action.userId]: _line, ...line } = state.line
      return adminLogged({ ...state, personal, line, closed: [...state.closed, action.userId] }, action.now,
        `ปิดบัญชี ${userById(action.userId).name}`, 'ลบความจำและการเชื่อมต่อแล้ว', 'warning')
    }
    case 'tick': {
      if (!state.runs.some((r) => r.status === 'running')) return state
      const runs = state.runs.map((r) => advanceRun(r, action.dt, action.now))
      const finished = runs.filter((r, i) => r.status === 'completed' && state.runs[i].status === 'running')
      return finished.reduce((s, r) => finishRun(s, r, action.now), { ...state, runs })
    }
    case 'updateLine':
      return withLine(state, action.userId, action.update)
    case 'addRun':
      return { ...state, runs: [action.run, ...state.runs] }
    case 'updateRun':
      return { ...state, runs: state.runs.map((r) => (r.id === action.id ? action.update(r) : r)) }
    case 'removeRun':
      return { ...state, runs: state.runs.filter((r) => r.id !== action.id) }
    case 'addAgent':
      return { ...state, agents: [action.agent, ...state.agents] }
    case 'updateAgent':
      return { ...state, agents: state.agents.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) }
    case 'addSkill':
      return { ...state, skills: [action.skill, ...state.skills] }
    case 'attachSkill':
      return {
        ...state,
        agents: state.agents.map((a) =>
          action.agentIds.includes(a.id) && !a.skills.includes(action.skillId) ? { ...a, skills: [...a.skills, action.skillId] } : a),
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
    case 'savePersonal': {
      const current = state.personal[action.userId] ?? { name: 'Agent ของคุณ', setup: 'pending', memories: [] }
      return { ...state, personal: { ...state.personal, [action.userId]: { ...current, ...action.patch } } }
    }
    case 'resolveOutward':
      return resolveOutward(state, action)
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

  // One clock drives every running Run, so progress continues while the user navigates.
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
    /**
     * Plan a request; by default it waits so the user can review which agents will run.
     * `autoStart` is a boolean or a predicate on the plan, for callers whose decision depends on what was planned.
     */
    const planRun = (prompt, opts, ctx, { threadId, autoStart = false, attachments = [], line, useMemory = true } = {}) => {
      const plan = planRequest(prompt, { ...ctx, ...opts })
      const owner = VIEW_PERSONAS[viewRef.current]
      // The Personal agent uses only the Memories that bear on this request, and the Run records which.
      const memoryUsed = useMemory ? relevantMemories(ctx.personal?.[owner]?.memories ?? [], prompt).map((m) => m.text) : []
      const made = createRun({ prompt, plan, owner, threadId })
      // A request called in from a LINE group is answered there, which is a post and waits for the User's yes.
      const outward = line?.chat === 'group'
        ? { type: 'line-group', status: 'asking', draft: { group: GROUP_NAME, text: groupSummary(made) } }
        : outwardFor(prompt, userById(owner).name)
      const run = { ...made, attachments, memoryUsed, outward, line }
      const start = typeof autoStart === 'function' ? autoStart(plan) : autoStart
      dispatch({ type: 'addRun', run: start ? startRun(run) : run })
      return run.id
    }

    const lineUpdate = (update) => dispatch({ type: 'updateLine', userId: VIEW_PERSONAS[viewRef.current], update })
    return {
      toast,
      dismissToast: (id) => dispatch({ type: 'dismissToast', id }),
      planRun,
      startRun: (id) => dispatch({ type: 'updateRun', id, update: (r) => startRun(r) }),
      /** Offer the signed-in User a code to link their LINE with (it expires soon). */
      lineCode: () => lineUpdate((l) => ({ ...l, code: newCode(), expiresAt: Date.now() + CODE_TTL_MS })),
      /** Whether the bot tells the User on LINE when a Run they started in the app finishes. */
      lineNotify: (on) => lineUpdate((l) => ({ ...l, notify: on })),
      /** Add the bot to the simulated group; the first thing it does there is say that it reads only what calls it. */
      lineInviteBot: () => lineUpdate((l) => ({ ...l, botInGroup: true, group: [...l.group, say('bot', GROUP_INTRO)] })),
      /**
       * The User writes in their simulated LINE `chat` ('private' or 'group') and the bot answers by its rules (lib/line.js).
       * `ctx` is the state, as for planRun; `useMemory` is the User's choice, for this one message, to let the bot use their Memory in the group.
       */
      lineSend: (chat, text, ctx, { useMemory = chat === 'private' } = {}) => {
        if (!ctx.apps.line) return
        const heard = hear(lineOf(ctx), chat, text, Date.now())
        const mine = say('me', text)
        const talk = (...messages) => lineUpdate((l) => ({ ...l, linked: l.linked || Boolean(heard.bind), code: heard.bind ? null : l.code, [chat]: [...l[chat], ...messages] }))
        if (heard.work) {
          planRun(heard.work, {}, ctx, { autoStart: true, line: { chat }, useMemory })
          talk(mine, ...(chat === 'private' ? [say('bot', 'รับงานแล้ว กำลังทำ เสร็จแล้วจะส่งสรุปมาให้ที่นี่')] : []))
        } else talk(mine, ...(heard.reply ? [say('bot', heard.reply)] : []))
      },
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
      updateAgent: (id, patch) => dispatch({ type: 'updateAgent', id, patch }),
      addAgent: (agent) => { const a = holdForAdmin('agent', agent); dispatch({ type: 'addAgent', agent: a }); return a },
      addSkill: (skill) => { const sk = holdForAdmin('skill', skill); dispatch({ type: 'addSkill', skill: sk }); return sk },
      attachSkill: (skillId, agentIds) => dispatch({ type: 'attachSkill', skillId, agentIds }),
      /** Merge `patch` (name, setup, memories) into the signed-in User's Personal agent. */
      savePersonal: (patch) => dispatch({ type: 'savePersonal', userId: VIEW_PERSONAS[viewRef.current], patch }),
      /** The User answers an Outward action their Personal agent asked about: `decision` is 'done' or 'declined'; `via` 'auto' when it needed no asking. */
      resolveOutward: (runId, decision, via = 'user') => dispatch({ type: 'resolveOutward', runId, decision, via, now: Date.now() }),
      /** The Admin switches an app on or off for the whole company. */
      setApp: (app, on) => dispatch({ type: 'setApp', app, on, now: Date.now() }),
      /** The Admin unlinks one User's LINE: they link it again with a new code. */
      disconnectLine: (userId) => dispatch({ type: 'disconnectLine', userId, now: Date.now() }),
      /** The Admin closes an employee's account: their Memory and Connections are deleted. */
      closeAccount: (userId) => dispatch({ type: 'closeAccount', userId, now: Date.now() }),
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
