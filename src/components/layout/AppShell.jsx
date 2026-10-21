import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, Bot, LayoutDashboard, Menu, PanelLeftClose, PanelLeftOpen, Plus, Server, ShieldCheck, Sparkles, Workflow, X, Cloud,
} from 'lucide-react'
import { useStore } from '../../store/AppStore'
import { userById } from '../../data/catalog'
import { cn } from '../../lib/utils'
import { skillLink } from '../../lib/routes'
import usePersistentState from '../../lib/usePersistentState'
import { Avatar, Toaster } from '../ui/Overlay'
import Button from '../ui/Button'
import EntityIcon from '../agents/EntityIcon'
import { SearchInput } from '../ui/Form'
import { HelpButton } from './Help'
import logo from '../../assets/icn-logo.png'

const NAV = [
  { section: 'งานของฉัน', items: [
    { to: '/', label: 'หน้าหลัก', icon: LayoutDashboard, end: true },
    { to: '/workspace', label: 'สั่งงาน AI', icon: Sparkles, live: true },
    { to: '/workflows', label: 'สายงาน', icon: Workflow },
    { to: '/agents', label: 'ผู้ช่วย AI', icon: Bot },
  ] },
  { section: 'องค์กร', items: [
    { to: '/governance', label: 'ภาพรวมและการกำกับดูแล', icon: ShieldCheck },
  ] },
]

/** `collapsed` shrinks to an icon rail; labels move into tooltips. Only the desktop sidebar collapses. */
function Sidebar({ onNavigate, collapsed = false, onToggle }) {
  const { state } = useStore()
  const running = state.runs.filter((r) => r.status === 'running').length
  return (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onNavigate} title={collapsed ? 'ICN AI Hub' : undefined} className={cn('flex items-center gap-2.5 py-5', collapsed ? 'justify-center px-2' : 'px-5')}>
        <img src={logo} alt="ICN" className="size-9 rounded-lg ring-1 ring-slate-200" />
        {!collapsed && (
          <span>
            <span className="block text-sm font-semibold leading-tight text-slate-900">ICN AI Hub</span>
            <span className="block text-[11px] leading-tight text-slate-500">Enterprise AI Workspace</span>
          </span>
        )}
      </Link>
      <div className={collapsed ? 'flex justify-center px-2' : 'px-3'}>
        {collapsed
          ? <Button variant="primary" size="icon" icon={Plus} to="/workspace?new=1" data-tour="new-task" aria-label="สั่งงานใหม่" title="สั่งงานใหม่" className="!size-9" />
          : <Button variant="primary" icon={Plus} to="/workspace?new=1" data-tour="new-task" onClick={onNavigate} className="w-full justify-center">สั่งงานใหม่</Button>}
      </div>
      <nav data-tour="nav" className={cn('mt-4 flex-1 overflow-y-auto', collapsed ? 'space-y-3 px-2' : 'space-y-5 px-3')} aria-label="Main">
        {NAV.map((group, i) => (
          <div key={group.section}>
            {collapsed
              ? i > 0 && <hr className="mx-2 mb-3 border-slate-200" />
              : <p className="mb-1 px-2 text-[11px] font-medium text-slate-400">{group.section}</p>}
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end, live }) => (
                <li key={to}>
                  <NavLink
                    to={to} end={end} onClick={onNavigate} title={collapsed ? label : undefined} aria-label={collapsed ? label : undefined}
                    className={({ isActive }) => cn(
                      'relative flex items-center gap-2.5 rounded-lg py-1.5 text-sm font-medium transition',
                      collapsed ? 'justify-center px-0 py-2' : 'px-2',
                      isActive ? 'bg-slate-900/[0.06] text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    <Icon className="size-[18px]" aria-hidden />
                    {!collapsed && <span className="flex-1">{label}</span>}
                    {live && running > 0 && (collapsed
                      ? <span className="absolute top-1 right-1.5 size-2 animate-pulse rounded-full bg-brand-500 ring-2 ring-slate-50" />
                      : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-1.5 text-[11px] font-semibold text-brand-700">
                          <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />{running}
                        </span>
                      ))}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="m-3 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-medium text-slate-700">การประมวลผล AI</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">ข้อมูลลับประมวลผลภายในบริษัทเสมอ</p>
          <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-slate-100">
            <span className="bg-emerald-500" style={{ width: '63%' }} />
            <span className="bg-slate-400" style={{ width: '37%' }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><Server className="size-3" /> Local 63%</span>
            <span className="flex items-center gap-1"><Cloud className="size-3" /> Cloud 37%</span>
          </div>
        </div>
      )}
      {onToggle && (
        <button
          type="button" onClick={onToggle} aria-label={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'} title={collapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
          className={cn('mb-3 flex items-center gap-2 rounded-lg py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800', collapsed ? 'mx-2 justify-center' : 'mx-3 px-2')}
        >
          {collapsed ? <PanelLeftOpen className="size-[18px]" /> : <><PanelLeftClose className="size-[18px]" /> ย่อแถบเมนู</>}
        </button>
      )}
    </div>
  )
}

function GlobalSearch() {
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

  const go = (to) => { setOpen(false); setQ(''); navigate(to) }
  return (
    <div ref={box} data-tour="search" className="relative w-full max-w-md">
      <SearchInput
        placeholder="ค้นหาผู้ช่วย ทักษะ หรือสายงาน…" value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) go(results[0].to) }}
        aria-label="ค้นหาทั้งระบบ"
      />
      {open && term && (
        <div className="rise absolute top-11 right-0 left-0 z-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
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
  const { state } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const me = userById(state.userId)
  // The workspace has its own history panel, so the menu starts as an icon rail there to avoid two wide sidebars.
  // A toggle on that page is a one-off override; elsewhere it is remembered.
  const [rememberedCollapsed, setRememberedCollapsed] = usePersistentState('icn.sidebar.collapsed', false)
  const [workspaceToggle, setWorkspaceToggle] = useState(null)
  const onWorkspace = pathname === '/workspace'
  const collapsed = workspaceToggle ?? (onWorkspace || rememberedCollapsed)
  const toggle = () => (onWorkspace ? setWorkspaceToggle(!collapsed) : setRememberedCollapsed(!collapsed))
  useEffect(() => { window.scrollTo(0, 0); setWorkspaceToggle(null) }, [pathname])

  return (
    <div className={cn('min-h-screen transition-[padding] duration-200', collapsed ? 'lg:pl-16' : 'lg:pl-64')}>
      <aside className={cn('fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-slate-50/80 backdrop-blur transition-[width] duration-200 lg:block', collapsed ? 'w-16' : 'w-64')}>
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </aside>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setMenuOpen(false)} />
          <aside className="rise absolute inset-y-0 left-0 w-72 bg-slate-50 shadow-xl">
            <button type="button" onClick={() => setMenuOpen(false)} className="absolute top-5 right-3 rounded p-1 text-slate-500" aria-label="ปิดเมนู"><X className="size-5" /></button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6">
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="เปิดเมนู">
          <Menu className="size-5" />
        </button>
        <GlobalSearch />
        <div className="ml-auto flex items-center gap-1">
          <HelpButton />
          <button type="button" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="การแจ้งเตือน">
            <Bell className="size-[18px]" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-3 sm:flex">
            <Avatar name={me.name} />
            <div className="leading-tight">
              <div className="text-sm font-medium text-slate-800">{me.name}</div>
              <div className="text-[11px] text-slate-500">{me.title}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  )
}
