import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bot, Menu, PanelLeftClose, PanelLeftOpen, Search, ShieldCheck, SquarePen, Workflow, X,
} from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { userById } from '../../data/catalog'
import { cn, isToday } from '../../lib/utils'
import { skillLink } from '../../lib/routes'
import { threadsOf } from '../../lib/runs'
import usePersistentState from '../../lib/usePersistentState'
import { Avatar, Toaster } from '../ui/Overlay'
import EntityIcon from '../agents/EntityIcon'
import { SearchInput } from '../ui/Form'
import { HelpButton } from './Help'
import { useTour } from '../tour/Tour'
import logo from '../../assets/icn-logo.png'

const NAV = [
  { section: 'งานของฉัน', items: [
    { to: '/workflows', label: 'สายงาน', icon: Workflow },
    { to: '/agents', label: 'ผู้ช่วย AI', icon: Bot },
  ] },
  { section: 'องค์กร', items: [
    { to: '/governance', label: 'ภาพรวมและการกำกับดูแล', icon: ShieldCheck },
  ] },
]

const itemClass = (isActive) => cn(
  'relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition',
  isActive ? 'bg-slate-900/[0.06] text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
)

/** Chat history (Threads), newest first and grouped by day, as in ChatGPT, Claude or Gemini. One click opens the Thread. */
function ChatHistory({ onNavigate }) {
  const { state } = useStore()
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const threads = useMemo(() => threadsOf(state.runs), [state.runs])
  const activeThreadId = pathname === '/workspace' ? state.runs.find((r) => r.id === params.get('run'))?.threadId : null
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
function Sidebar({ onNavigate, collapsed = false, onToggle, onSearch, focusSearch = false }) {
  const { state } = useStore()
  const me = userById(state.userId)
  const { pathname, search } = useLocation()
  const onNewChat = pathname === '/workspace' && !new URLSearchParams(search).has('run')
  return (
    <div className={cn('flex h-full flex-col py-3', collapsed ? 'px-2' : 'px-3')}>
      <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'justify-between pl-2')}>
        <Link to="/workspace" onClick={onNavigate} title="ICN AI Hub" className="flex items-center gap-2.5">
          <img src={logo} alt="ICN" className="size-8 rounded-lg ring-1 ring-slate-200" />
          {!collapsed && <span className="text-sm font-semibold text-slate-900">ICN AI Hub</span>}
        </Link>
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
        {collapsed
          ? <button type="button" onClick={onSearch} aria-label="ค้นหา" title="ค้นหา" className={cn(itemClass(false), 'w-full justify-center py-2')}><Search className="size-[18px]" /></button>
          : <GlobalSearch onNavigate={onNavigate} autoFocus={focusSearch} />}
      </div>

      <nav className={cn('mt-4', collapsed ? 'space-y-3' : 'space-y-4')} aria-label="Main">
        {NAV.map((group, i) => (
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

      <div className={cn('mt-3 flex items-center gap-2.5 border-t border-slate-200 pt-3', collapsed ? 'justify-center' : 'px-2')} title={collapsed ? me.name : undefined}>
        <Avatar name={me.name} />
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-medium text-slate-800">{me.name}</div>
            <div className="truncate text-[11px] text-slate-500">{me.title}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function GlobalSearch({ onNavigate, autoFocus = false }) {
  const { state } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  useEffect(() => {
    const close = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const term = q.trim().toLowerCase()
  const match = (s) => s.toLowerCase().includes(term)
  const results = term ? [
    ...state.agents.filter((a) => match(a.name) || match(a.description)).slice(0, 5).map((a) => ({ id: a.id, label: a.name, sub: 'ผู้ช่วย', icon: a.kind, to: `/agents/${a.id}` })),
    ...state.skills.filter((s) => match(s.name) || match(s.purpose)).slice(0, 4).map((s) => ({ id: s.id, label: s.name, sub: 'ทักษะ', icon: s.icon, to: skillLink(s.id), skill: true })),
    ...state.workflows.filter((w) => match(w.name)).slice(0, 3).map((w) => ({ id: w.id, label: w.name, sub: 'สายงาน', icon: 'condition', to: `/workflows?id=${w.id}`, skill: true })),
  ] : []

  const go = (to) => { setOpen(false); setQ(''); navigate(to); onNavigate?.() }
  return (
    <div ref={box} data-tour="search" className="relative">
      <SearchInput
        placeholder="ค้นหาผู้ช่วย ทักษะ สายงาน…" value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].to) }}
        aria-label="ค้นหาทั้งระบบ" autoFocus={autoFocus}
      />
      {open && term && (
        <div className="rise absolute top-11 left-0 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {results.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">ไม่พบผลลัพธ์สำหรับ “{q}”</p>}
          {results.map((r) => (
            <button key={r.id} type="button" onClick={() => go(r.to)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50">
              <EntityIcon icon={r.icon} size="sm" tone={r.skill ? 'skill' : 'agent'} />
              <span className="flex-1 truncate text-sm text-slate-800">{r.label}</span>
              <span className="text-xs text-slate-400">{r.sub}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = usePersistentState('icn.sidebar.collapsed', false)
  const [focusSearch, setFocusSearch] = useState(false)
  // A tour step pointing into the sidebar needs it on screen: expanded on desktop, the drawer on phones.
  const { sidebarStep } = useTour()
  const railOnly = collapsed && !sidebarStep
  const drawerOpen = menuOpen || sidebarStep
  const toggle = () => { setFocusSearch(false); setCollapsed(!collapsed) }
  const openSearch = () => { setFocusSearch(true); setCollapsed(false) }
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className={cn('min-h-screen transition-[padding] duration-200', railOnly ? 'lg:pl-16' : 'lg:pl-64')}>
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-slate-50 transition-[width] duration-200 lg:block', railOnly ? 'w-16' : 'w-64')}>
        <Sidebar collapsed={railOnly} onToggle={toggle} onSearch={openSearch} focusSearch={focusSearch} />
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
          <img src={logo} alt="ICN" className="size-7 rounded-md ring-1 ring-slate-200" />
          <span className="text-sm font-semibold text-slate-900">ICN AI Hub</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <HelpButton />
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pt-2 pb-6 sm:px-6 lg:px-8 lg:pb-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
