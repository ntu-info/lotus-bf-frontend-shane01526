import { useCallback, useRef, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { SavedStudies } from './components/SavedStudies'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')
  const [activeTab, setActiveTab] = useState('studies') // 'studies' | 'saved'

  const handlePickTerm = useCallback((t) => {
    setQuery((q) => (q ? `${q} ${t}` : t))
  }, [setQuery])

  // --- resizable panes state ---
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([25, 45, 30])
  const MIN_PX = 240

  const startDrag = (which, e) => {
    e.preventDefault()
    const startX = e.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width
    const curPx = sizes.map(p => (p / 100) * total)

    const onMouseMove = (ev) => {
      const dx = ev.clientX - startX
      if (which === 0) {
        let newLeft = curPx[0] + dx
        let newMid = curPx[1] - dx
        if (newLeft < MIN_PX) { newMid -= (MIN_PX - newLeft); newLeft = MIN_PX }
        if (newMid < MIN_PX) { newLeft -= (MIN_PX - newMid); newMid = MIN_PX }
        const s0 = (newLeft / total) * 100
        const s1 = (newMid / total) * 100
        const s2 = 100 - s0 - s1
        setSizes([s0, s1, Math.max(s2, 0)])
      } else {
        let newMid = curPx[1] + dx
        let newRight = curPx[2] - dx
        if (newMid < MIN_PX) { newRight -= (MIN_PX - newMid); newMid = MIN_PX }
        if (newRight < MIN_PX) { newMid -= (MIN_PX - newRight); newRight = MIN_PX }
        const s1 = (newMid / total) * 100
        const s2 = (newRight / total) * 100
        const s0 = (curPx[0] / total) * 100
        setSizes([s0, s1, Math.max(s2, 0)])
      }
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className="app app--morandi">
      <header className="app__header">
        <div className="app__header-top">
          <h1 className="app__title">LoTUS-BF</h1>
          <div className="app__version">v2.0</div>
        </div>
        <div className="app__subtitle">Location-or-Term Unified Search for Brain Functions</div>
      </header>

      <main className="app__grid" ref={gridRef}>
        <section className="card card--morandi" style={{ flexBasis: `${sizes[0]}%` }}>
          <div className="card__header">
            <span className="card__icon">🏷️</span>
            <div className="card__title">Terms</div>
          </div>
          <Terms onPickTerm={handlePickTerm} />
        </section>

        <div className="resizer" aria-label="Resize left/middle" onMouseDown={(e) => startDrag(0, e)}>
          <div className="resizer__handle" />
        </div>

        <section className="card card--morandi card--stack" style={{ flexBasis: `${sizes[1]}%` }}>
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
              onClick={() => setActiveTab('saved')}
            >
              <span className="studies-tab__icon">⭐</span>
              Saved Studies
            </button>
          </div>
          
          {activeTab === 'studies' ? (
            <Studies query={query} />
          ) : (
            <SavedStudies />
          )}
        </section>

        <div className="resizer" aria-label="Resize middle/right" onMouseDown={(e) => startDrag(1, e)}>
          <div className="resizer__handle" />
        </div>

        <section className="card card--morandi" style={{ flexBasis: `${sizes[2]}%` }}>
          <div className="card__header">
            <span className="card__icon">🧠</span>
            <div className="card__title">Brain Viewer</div>
          </div>
          <NiiViewer query={query} />
        </section>
      </main>

      <footer className="app__footer">
        <p>Powered by Neurosynth Database · National Taiwan University</p>
      </footer>
    </div>
  )
}
