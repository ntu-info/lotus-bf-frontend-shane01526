import { useCallback, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { SavedStudies } from './components/SavedStudies'
import { NiiViewer } from './components/NiiViewer'
import { AuthModal } from './components/AuthModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'

function AppContent() {
  const [query, setQuery] = useUrlQueryState('q')
  const [activeTab, setActiveTab] = useState('studies')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [brainViewExpanded, setBrainViewExpanded] = useState(false)
  
  const { user, logout, isAuthenticated } = useAuth()

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  return (
    <div className="app app--morandi app--two-layer">
      <header className="app__header">
        <div className="app__header-top">
          <div className="app__header-left">
            <h1 className="app__title">LoTUS-BF</h1>
            <div className="app__version">v2.0</div>
          </div>
          
          <div className="app__header-right">
            {isAuthenticated ? (
              <div className="app__user-menu">
                <div className="app__user-avatar">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="app__user-name">{user?.name || user?.email}</span>
                <button className="app__logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="app__auth-buttons">
                <button 
                  className="app__auth-btn app__auth-btn--login"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign In
                </button>
                <button 
                  className="app__auth-btn app__auth-btn--register"
                  onClick={() => setShowAuthModal(true)}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="app__subtitle">Location-or-Term Unified Search for Brain Functions</div>
      </header>

      <main className="app__two-layer-grid">
        {/* Upper Layer: Terms (1/3) + Query/Studies (2/3) */}
        <div className="app__upper-row">
          {/* Left: Terms (1/3 width) */}
          <section className="card card--morandi app__terms-section">
            <div className="card__header">
              <span className="card__icon">🏷️</span>
              <div className="card__title">Terms</div>
            </div>
            <Terms onPickTerm={handlePickTerm} />
          </section>

          {/* Right: Query Builder + Studies (2/3 width) */}
          <section className="card card--morandi card--stack app__query-section">
            <div className="card__header">
              <span className="card__icon">🔍</span>
              <div className="card__title">Query Builder</div>
            </div>
            <QueryBuilder query={query} setQuery={setQuery} />
            
            <div className="divider" />
            
            <div className="studies-tabs">
              <button 
                className={`studies-tab ${activeTab === 'studies' ? 'studies-tab--active' : ''}`}
                onClick={() => setActiveTab('studies')}
              >
                <span className="studies-tab__icon">📊</span>
                Search Results
              </button>
              <button 
                className={`studies-tab ${activeTab === 'saved' ? 'studies-tab--active' : ''}`}
                onClick={() => {
                  if (!isAuthenticated) {
                    setShowAuthModal(true)
                    return
                  }
                  setActiveTab('saved')
                }}
              >
                <span className="studies-tab__icon">⭐</span>
                Saved Studies
                {isAuthenticated && <span className="saved-badge">✓</span>}
              </button>
            </div>
            
            {activeTab === 'studies' ? (
              <Studies query={query} />
            ) : (
              <SavedStudies />
            )}
          </section>
        </div>

        {/* Lower Layer: Brain Viewer (full width) */}
        {!brainViewExpanded && (
          <section className="card card--morandi app__brain-section">
            <div className="card__header">
              <span className="card__icon">🧠</span>
              <div className="card__title">Brain Viewer</div>
            </div>
            <NiiViewer query={query} expanded={false} />
            <button 
              className="brain-viewer-toggle"
              onClick={() => setBrainViewExpanded(true)}
            >
              <span>🔍</span>
              <span>Expand Brain Viewer</span>
            </button>
          </section>
        )}
      </main>

      {brainViewExpanded && (
        <div className="brain-viewer-expanded">
          <div className="brain-viewer-expanded__header">
            <div className="brain-viewer-expanded__title">
              <span>🧠</span>
              <span>Brain Viewer - Expanded Mode</span>
            </div>
            <button 
              className="brain-viewer-expanded__close"
              onClick={() => setBrainViewExpanded(false)}
            >
              ✕ Exit Expanded Mode
            </button>
          </div>
          <NiiViewer query={query} expanded={true} />
        </div>
      )}

      <footer className="app__footer">
        <p>Powered by Neurosynth Database · National Taiwan University</p>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
