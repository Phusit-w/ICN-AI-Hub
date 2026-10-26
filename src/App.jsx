import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Workspace from './pages/Workspace'
import AgentLibrary from './pages/AgentLibrary'
import AgentDetail from './pages/AgentDetail'
import CreateAgent from './pages/CreateAgent'
import CreateSkill from './pages/CreateSkill'
import Governance from './pages/Governance'
import PersonalAgent from './pages/PersonalAgent'
import PersonalSetup from './pages/PersonalSetup'
import { skillLink } from './lib/routes'
import { isAdminView, useStore } from './store/AppStore'

// Admin-only pages are guarded at the route, not just hidden from the menu: in the User view an old or shared
// link (or switching view while on the page) lands on new chat instead.
function AdminOnly({ children }) {
  const { state } = useStore()
  return isAdminView(state) ? children : <Navigate to="/workspace" replace />
}

// Skills have no page of their own; old links (shared demo links too) land on the Agents page with their Skill open.
function OldSkillsLink() {
  const [params] = useSearchParams()
  return <Navigate to={skillLink(params.get('open'))} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* New chat is the home screen, as in ChatGPT, Claude or Gemini. */}
        <Route index element={<Navigate to="/workspace" replace />} />
        <Route path="workspace" element={<Workspace />} />
        {/* The Personal agent: what it knows about the User, and its first chat. */}
        <Route path="agent" element={<PersonalAgent />} />
        <Route path="agent/setup" element={<PersonalSetup />} />
        <Route path="agents" element={<AgentLibrary />} />
        <Route path="agents/new" element={<CreateAgent />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="skills" element={<OldSkillsLink />} />
        <Route path="skills/new" element={<CreateSkill />} />
        {/* Workflows became Agents with Steps (ADR 0001); old links land on the Agents page. */}
        <Route path="workflows" element={<Navigate to="/agents" replace />} />
        {/* The Community page is gone; shared items are found with the Agents page's "popular" filter. */}
        <Route path="community" element={<Navigate to="/agents?filter=popular" replace />} />
        <Route path="governance" element={<AdminOnly><Governance /></AdminOnly>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
