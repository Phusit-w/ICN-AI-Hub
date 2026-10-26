import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bot, Box, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, SquarePen, X,
} from 'lucide-react'
import { isAdminView, useStore } from '../../store/AppStore'
import { userById, VIEW_PERSONAS } from '../../data/catalog'
import { personalOf } from '../../lib/personal'
import { cn, isToday } from '../../lib/utils'
import { isChatRun, threadsOf } from '../../lib/runs'
import usePersistentState from '../../lib/usePersistentState'
import { Avatar, Toaster } from '../ui/Overlay'
import MenuButton from '../ui/Menu'
import { HelpButton } from './Help'
import SearchPopup from './SearchPopup'
import { useCube } from '../../lib/useCube'
import { useTour } from '../tour/Tour'
import logo from '../../assets/icn-logo-clear.png' // the logo with its pale-blue square made transparent

const NAV = [
  { section: 'งานของฉัน', items: [
    { to: '/agents', label: 'AI Agent', icon: Bot },
  ] },
  { section: 'องค์กร', adminOnly: true, items: [
    { to: '/governance', label: 'ภาพรวมและการกำกับดูแล', icon: ShieldCheck },
  ] },
]

const VIEWS = [
  { id: 'user', label: 'มุมมองผู้ใช้ทั่วไป (User)' },
  { id: 'admin', label: 'มุมมองแอดมิน (Admin)' },
]

/** The user at the bottom of the sidebar, as in ChatGPT, Claude or Gemini; clicking it switches the presenter's view. */
function ProfileMenu({ collapsed }) {
  const { state, actions } = useStore()
  const navigate = useNavigate()
  const me = userById(VIEW_PERSONAS[state.view])
  return (
    <MenuButton
      label={`โปรไฟล์และมุมมอง: ${me.name}`} className="mt-3 border-t border-slate-200 pt-3"
      items={[
        { label: personalOf(state).name, onSelect: () => navigate('/agent') },
        ...VIEWS.map((v) => ({ label: v.label, checked: state.view === v.id, onSelect: () => actions.setView(v.id) })),
      ]}
      triggerClassName={cn(itemClass(false), 'w-full gap-2.5 py-1.5 text-left', collapsed ? 'justify-center' : 'px-2')}
    >
      <Avatar name={me.name} />
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-medium text-slate-800">{me.name}</span>
          <span className="block truncate text-[11px] font-normal text-slate-500">{me.title}</span>
        </span>
      )}
    </MenuButton>
  )
}

const itemClass = (isActive) => cn(
  'relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition',
  isActive ? 'bg-slate-900/[0.06] text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
)

/** The Thread the user is looking at, or null when no Thread is on screen. */
function useOpenThreadId() {
  const { state } = useStore()
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  return pathname === '/workspace' ? state.runs.find((r) => r.id === params.get('run'))?.threadId ?? null : null
}

/**
 * When the user's multi-Agent Run finishes out of sight (on another page or in another Thread), a toast says so
 * and links to its Thread. It stays until clicked or closed, so the user doesn't have to watch for it.
 */
function RunFinishedToasts() {
  const { state, actions } = useStore()
  const openThreadId = useOpenThreadId()
  const wasRunning = useRef(null)
  useEffect(() => {
    const running = new Set(state.runs.filter((r) => r.status === 'running').map((r) => r.id))
    const before = wasRunning.current ?? running
    wasRunning.current = running
    state.runs
      .filter((r) => before.has(r.id) && r.status === 'completed' && !isChatRun(r) && r.owner === state.userId && r.threadId !== openThreadId)
      .forEach((r) => actions.toast(`งานของคุณเสร็จแล้ว: “${r.title}”`, { stay: true, action: { label: 'เปิดดู', to: `/workspace?run=${r.id}` } }))
  }, [state.runs, state.userId, openThreadId, actions])
  return null
}

/** Chat history (Threads), newest first and grouped by day, as in ChatGPT, Claude or Gemini. One click opens the Thread. */
function ChatHistory({ onNavigate }) {
  const { state } = useStore()
  const threads = useMemo(() => threadsOf(state.runs), [state.runs])
  const activeThreadId = useOpenThreadId()
  const groups = [
    { label: 'วันนี้', items: threads.filter((t) => isToday(t.latest.createdAt)) },
    { label: 'ก่อนหน้านี้', items: threads.filter((t) => !isToday(t.latest.createdAt)) },
  ].filter((g) => g.items.length)
  return (
    <nav aria-label="ประวัติแชต" className="mt-5 flex min-h-0 flex-1 flex-col">
      {threads.length === 0
        ? <p className="px-2 text-xs text-slate-400">ยังไม่มีแชต เริ่มแชตใหม่ได้เลย</p>
        : (
          <div className="-mr-1 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {groups.map((g) => (
              <div key={g.label}>
                <p className="px-2 pb-0.5 text-[11px] font-medium text-slate-400">{g.label}</p>
                <ul className="space-y-0.5">
                  {g.items.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/workspace?run=${t.latest.id}`} onClick={onNavigate} aria-current={t.id === activeThreadId ? 'page' : undefined} title={t.title}
                        className={cn(itemClass(t.id === activeThreadId), 'px-2 py-1.5 text-[13px] font-normal')}
                      >
                        <span className="flex-1 truncate">{t.title}</span>
                        {t.latest.status === 'running' && <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-brand-500" aria-label="กำลังทำ" />}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
    </nav>
  )
}

/**
 * The one sidebar, laid out like ChatGPT, Claude or Gemini: new chat (the home screen) and search on top, then the menu,
 * the chat history filling the middle, and the user at the bottom.
 * `collapsed` shrinks it to an icon rail without the history; labels move into tooltips. Only the desktop sidebar collapses.
 */
function Sidebar({ onNavigate, collapsed = false, onToggle }) {
  const { state } = useStore()
  const nav = NAV.filter((group) => !group.adminOnly || isAdminView(state))
  const { pathname, search } = useLocation()
  const onNewChat = pathname === '/workspace' && !new URLSearchParams(search).has('run')
  return (
    <div className={cn('flex h-full flex-col py-3', collapsed ? 'px-2' : 'px-3')}>
      {/* The logo alone, then the search icon beside the collapse button. */}
      <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'gap-2 pl-2', !onToggle && 'pr-9')}>
        <Link to="/workspace" onClick={onNavigate} title="ICN AI Hub" className="flex shrink-0 items-center gap-2.5">
          <img src={logo} alt="ICN" className="size-8" />
        </Link>
        {!collapsed && <span className="ml-auto w-9"><SearchPopup compact onNavigate={onNavigate} /></span>}
        {onToggle && (
          <button
            type="button" onClick={onToggle} aria-label={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'} title={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >{collapsed ? <PanelLeftOpen className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}</button>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <Link
          to="/workspace" onClick={onNavigate} data-tour="new-task" title={collapsed ? 'แชตใหม่' : undefined} aria-label={collapsed ? 'แชตใหม่' : undefined}
          aria-current={onNewChat ? 'page' : undefined}
          className={cn(itemClass(false), 'border bg-white shadow-sm', onNewChat ? 'border-brand-300 text-slate-900' : 'border-slate-200', collapsed ? 'justify-center py-2' : 'px-2 py-2')}
        >
          <SquarePen className="size-[18px]" aria-hidden />{!collapsed && 'แชตใหม่'}
        </Link>
        {collapsed && <SearchPopup compact onNavigate={onNavigate} />}
      </div>

      <nav className={cn('mt-4', collapsed ? 'space-y-3' : 'space-y-4')} aria-label="Main">
        {nav.map((group, i) => (
          <div key={group.section}>
            {i > 0 && (collapsed
              ? <hr className="mx-2 mb-3 border-slate-200" />
              : <p className="mb-1 px-2 text-[11px] font-medium text-slate-400">{group.section}</p>)}
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to} onClick={onNavigate} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}
                    className={({ isActive }) => cn(itemClass(isActive), collapsed ? 'justify-center py-2' : 'px-2 py-1.5')}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                    {!collapsed && <span className="flex-1">{label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {collapsed ? <div className="flex-1" /> : <ChatHistory onNavigate={onNavigate} />}

      <CubeToggle collapsed={collapsed} />
      <ProfileMenu collapsed={collapsed} />
    </div>
  )
}

/** Switches the Cube mascot on or off for every page; the choice stays in this browser. */
function CubeToggle({ collapsed }) {
  const [on, setOn] = useCube()
  return (
    <button
      type="button" aria-pressed={on} onClick={() => setOn(!on)} aria-label="เปิดหรือปิดตัว Cube" title={collapsed ? `Cube ${on ? 'เปิด' : 'ปิด'}` : undefined}
      className={cn(itemClass(false), 'mt-2 w-full', collapsed ? 'justify-center py-2' : 'px-2 py-1.5', !on && 'text-slate-400')}
    >
      <Box className="size-[18px]" aria-hidden />
      {!collapsed && <><span className="flex-1 text-left">Cube</span><span className="text-xs text-slate-400">{on ? 'เปิด' : 'ปิด'}</span></>}
    </button>
  )
}
export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = usePersistentState('icn.sidebar.collapsed', false)
  // A tour step pointing into the sidebar needs it on screen: expanded on desktop, the drawer on phones.
  const { sidebarStep } = useTour()
  const railOnly = collapsed && !sidebarStep
  const drawerOpen = menuOpen || sidebarStep
  const toggle = () => setCollapsed(!collapsed)
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className={cn('min-h-screen transition-[padding] duration-200', railOnly ? 'lg:pl-16' : 'lg:pl-64')}>
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-slate-50 transition-[width] duration-200 lg:block', railOnly ? 'w-16' : 'w-64')}>
        <Sidebar collapsed={railOnly} onToggle={toggle} />
      </aside>
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setMenuOpen(false)} />
          <aside className="rise absolute inset-y-0 left-0 w-72 bg-slate-50 shadow-xl">
            <button type="button" onClick={() => setMenuOpen(false)} className="absolute top-3.5 right-3 z-10 rounded p-1.5 text-slate-500" aria-label="ปิดเมนู"><X className="size-5" /></button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* A quiet top bar, as in ChatGPT, Claude or Gemini: no border and no search; the menu on phones, then help. */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 bg-canvas/90 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="เปิดเมนู">
          <Menu className="size-5" />
        </button>
        <Link to="/workspace" className="flex items-center gap-2 lg:hidden">
          <img src={logo} alt="ICN" className="size-7" />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <HelpButton />
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pt-2 pb-6 sm:px-6 lg:px-8 lg:pb-8">
        <Outlet />
      </main>
      <Toaster />
      <RunFinishedToasts />
    </div>
  )
}
