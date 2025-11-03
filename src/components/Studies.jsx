import { API_BASE } from '../api'
import { useEffect, useMemo, useState } from 'react'

function classNames (...xs) { return xs.filter(Boolean).join(' ') }

// Helper functions for saved studies
const getSavedStudies = () => {
  try {
    const saved = localStorage.getItem('lotus-saved-studies')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const saveStudy = (study) => {
  try {
    const saved = getSavedStudies()
    const studyId = `${study.year}-${study.title}-${study.authors}`
    
    // Check if already saved
    if (saved.some(s => `${s.year}-${s.title}-${s.authors}` === studyId)) {
      return false
    }
    
    saved.push({ ...study, savedAt: new Date().toISOString() })
    localStorage.setItem('lotus-saved-studies', JSON.stringify(saved))
    return true
  } catch {
    return false
  }
}

const isStudySaved = (study) => {
  const saved = getSavedStudies()
  const studyId = `${study.year}-${study.title}-${study.authors}`
  return saved.some(s => `${s.year}-${s.title}-${s.authors}` === studyId)
}

export function Studies ({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [savedStates, setSavedStates] = useState({})
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) return
    let alive = true
    const ac = new AbortController()
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const url = `${API_BASE}/query/${encodeURIComponent(query)}/studies`
        const res = await fetch(url, { signal: ac.signal })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!alive) return
        const list = Array.isArray(data?.results) ? data.results : []
        setRows(list)
        
        // Update saved states
        const states = {}
        list.forEach((study, idx) => {
          states[idx] = isStudySaved(study)
        })
        setSavedStates(states)
      } catch (e) {
        if (!alive) return
        setErr(`Unable to fetch studies: ${e?.message || e}`)
        setRows([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false; ac.abort() }
  }, [query])

  const changeSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const arr = [...rows]
    const dir = sortDir === 'asc' ? 1 : -1
    arr.sort((a, b) => {
      const A = a?.[sortKey]
      const B = b?.[sortKey]
      if (sortKey === 'year') return (Number(A || 0) - Number(B || 0)) * dir
      return String(A || '').localeCompare(String(B || ''), 'en') * dir
    })
    return arr
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleSave = (study, idx) => {
    const success = saveStudy(study)
    if (success) {
      setSavedStates(prev => ({ ...prev, [idx]: true }))
      // Show a brief success message
      const btn = document.getElementById(`save-btn-${idx}`)
      if (btn) {
        const original = btn.textContent
        btn.textContent = '✓ Saved'
        btn.style.background = '#9eb09e'
        setTimeout(() => {
          btn.textContent = original
          btn.style.background = ''
        }, 2000)
      }
    }
  }

  return (
    <div className='studies-container'>
      {!query && (
        <div className='studies-empty'>
          <div className='studies-empty__icon'>📚</div>
          <div className='studies-empty__title'>No Query Active</div>
          <div className='studies-empty__text'>Build a query above to see related studies</div>
        </div>
      )}

      {query && loading && (
        <div className='studies-skeleton'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='studies-skeleton__row' />
          ))}
        </div>
      )}

      {query && err && (
        <div className='alert alert--error'>
          {err}
        </div>
      )}

      {query && !loading && !err && (
        <>
          <div className='studies-info'>
            <span>Showing <strong>{query}</strong></span>
            <span className='studies-count'>
              {sorted.length} {sorted.length === 1 ? 'study' : 'studies'} found
            </span>
          </div>

          <div className='studies-table-wrapper'>
            <table className='studies-table'>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  {[
                    { key: 'year', label: 'Year', width: '80px' },
                    { key: 'journal', label: 'Journal', width: '200px' },
                    { key: 'title', label: 'Title' },
                    { key: 'authors', label: 'Authors', width: '200px' }
                  ].map(({ key, label, width }) => (
                    <th 
                      key={key} 
                      onClick={() => changeSort(key)}
                      style={{ width, cursor: 'pointer' }}
                    >
                      <span className='studies-table__header'>
                        {label}
                        <span className='studies-table__sort'>
                          {sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className='studies-table__empty'>
                      No studies found matching your query
                    </td>
                  </tr>
                ) : (
                  pageRows.map((study, i) => {
                    const globalIdx = (page - 1) * pageSize + i
                    const isSaved = savedStates[globalIdx]
                    
                    return (
                      <tr key={i} className={classNames('studies-table__row', i % 2 && 'studies-table__row--alt')}>
                        <td>
                          <button
                            id={`save-btn-${globalIdx}`}
                            onClick={() => handleSave(study, globalIdx)}
                            disabled={isSaved}
                            className='studies-save-btn'
                            title={isSaved ? 'Already saved' : 'Save this study'}
                          >
                            {isSaved ? '★' : '☆'}
                          </button>
                        </td>
                        <td className='studies-table__year'>{study.year ?? ''}</td>
                        <td className='studies-table__journal'>{study.journal || ''}</td>
                        <td className='studies-table__title'>
                          <div className='studies-table__title-text' title={study.title}>
                            {study.title || ''}
                          </div>
                        </td>
                        <td className='studies-table__authors'>{study.authors || ''}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className='studies-pagination'>
            <div className='studies-pagination__info'>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className='studies-pagination__controls'>
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(1)}
                className='studies-pagination__btn'
              >
                ⏮
              </button>
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className='studies-pagination__btn'
              >
                Previous
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className='studies-pagination__btn'
              >
                Next
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(totalPages)}
                className='studies-pagination__btn'
              >
                ⏭
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .studies-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .studies-empty {
          padding: 60px 20px;
          text-align: center;
          background: rgba(139, 157, 158, 0.08);
          border-radius: 12px;
        }

        .studies-empty__icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .studies-empty__title {
          font-size: 16px;
          font-weight: 600;
          color: var(--morandi-text);
          margin-bottom: 8px;
        }

        .studies-empty__text {
          font-size: 13px;
          color: var(--morandi-text-muted);
        }

        .studies-skeleton {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .studies-skeleton__row {
          height: 50px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .studies-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(139, 157, 158, 0.08);
          border-radius: 10px;
          font-size: 13px;
          color: var(--morandi-text);
        }

        .studies-count {
          color: var(--morandi-primary);
          font-weight: 600;
        }

        .studies-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--morandi-border);
          border-radius: 10px;
        }

        .studies-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .studies-table thead {
          background: linear-gradient(135deg, var(--morandi-primary), var(--morandi-secondary));
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .studies-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          white-space: nowrap;
        }

        .studies-table__header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .studies-table__sort {
          font-size: 10px;
          opacity: 0.8;
        }

        .studies-table__row {
          border-bottom: 1px solid var(--morandi-border);
          transition: background 0.2s ease;
        }

        .studies-table__row:hover {
          background: rgba(139, 157, 158, 0.05);
        }

        .studies-table__row--alt {
          background: rgba(245, 243, 240, 0.5);
        }

        .studies-table td {
          padding: 12px;
          vertical-align: top;
        }

        .studies-table__year {
          white-space: nowrap;
          font-weight: 600;
          color: var(--morandi-primary);
        }

        .studies-table__journal {
          color: var(--morandi-text-muted);
        }

        .studies-table__title-text {
          max-width: 500px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .studies-table__authors {
          color: var(--morandi-text-muted);
          font-size: 12px;
        }

        .studies-table__empty {
          padding: 40px;
          text-align: center;
          color: var(--morandi-text-muted);
        }

        .studies-save-btn {
          padding: 6px 10px;
          background: transparent;
          border: 1px solid var(--morandi-border);
          color: var(--morandi-warning);
          font-size: 16px;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .studies-save-btn:hover:not(:disabled) {
          background: var(--morandi-warning);
          color: white;
          border-color: var(--morandi-warning);
          transform: scale(1.1);
        }

        .studies-save-btn:disabled {
          color: var(--morandi-success);
          border-color: var(--morandi-success);
          cursor: not-allowed;
          opacity: 0.7;
        }

        .studies-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(139, 157, 158, 0.05);
          border-radius: 10px;
          font-size: 13px;
        }

        .studies-pagination__info {
          color: var(--morandi-text);
        }

        .studies-pagination__controls {
          display: flex;
          gap: 8px;
        }

        .studies-pagination__btn {
          padding: 8px 14px;
          background: white;
          border: 1px solid var(--morandi-border);
          color: var(--morandi-text);
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .studies-pagination__btn:hover:not(:disabled) {
          background: var(--morandi-primary);
          color: white;
          border-color: var(--morandi-primary);
        }

        .studies-pagination__btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
