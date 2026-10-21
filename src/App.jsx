import { Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Workspace from './pages/Workspace'
import AgentLibrary from './pages/AgentLibrary'
import AgentDetail from './pages/AgentDetail'
import CreateAgent from './pages/CreateAgent'
import CreateSkill from './pages/CreateSkill'
import Workflows from './pages/Workflows'
import Governance from './pages/Governance'
import { skillLink } from './lib/routes'

// Skills moved into a tab of the Agents page; old links (shared demo links too) keep their open Skill.
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
        <Route path="agents" element={<AgentLibrary />} />
        <Route path="agents/new" element={<CreateAgent />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="skills" element={<OldSkillsLink />} />
        <Route path="skills/new" element={<CreateSkill />} />
        <Route path="workflows" element={<Workflows />} />
        {/* The Community page is gone; shared items are found with the Agents page's "popular" filter. */}
        <Route path="community" element={<Navigate to="/agents?filter=popular" replace />} />
        <Route path="governance" element={<Governance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
