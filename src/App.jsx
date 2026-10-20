import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Workspace from './pages/Workspace'
import AgentLibrary from './pages/AgentLibrary'
import AgentDetail from './pages/AgentDetail'
import CreateAgent from './pages/CreateAgent'
import SkillLibrary from './pages/SkillLibrary'
import CreateSkill from './pages/CreateSkill'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Community from './pages/Community'
import Governance from './pages/Governance'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="workspace" element={<Workspace />} />
        <Route path="agents" element={<AgentLibrary />} />
        <Route path="agents/new" element={<CreateAgent />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="skills" element={<SkillLibrary />} />
        <Route path="skills/new" element={<CreateSkill />} />
        <Route path="workflows" element={<WorkflowBuilder />} />
        <Route path="community" element={<Community />} />
        <Route path="governance" element={<Governance />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
