import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AppStoreProvider } from './store/AppStore'
import { TourProvider } from './components/tour/Tour'
import './index.css'

// The Workspace's own history panel is gone (chat history lives in the sidebar); drop its old setting.
try { localStorage.removeItem('icn.workspace.historyCollapsed') } catch { /* storage blocked */ }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <AppStoreProvider>
        <TourProvider>
          <App />
        </TourProvider>
      </AppStoreProvider>
    </HashRouter>
  </StrictMode>,
)
