import { useEffect, useState } from 'react'

function classNames (...xs) { return xs.filter(Boolean).join(' ') }

const getSavedStudies = () => {
  try {
    const saved = localStorage.getItem('lotus-saved-studies')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

const removeStudy = (index) => {
  try {
    const saved = getSavedStudies()
    saved.splice(index, 1)
    localStorage.setItem('lotus-saved-studies', JSON.stringify(saved))
    return true
  } catch {
    return false
  }
}

const exportToJSON = (studies) => {
  const dataStr = JSON.stringify(studies, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `lotus-saved-studies-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function SavedStudies() {
  const [studies, setStudies] = useState([])
  const [sortKey, setSortKey] = useState('savedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => {
    setStudies(getSavedStudies())
  }, [])

  const changeSort = (key) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = [...studies].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    const A = a?.[sortKey]
    const B = b?.[sortKey]
    
    if (sortKey === 'year') return (Number(A || 0) - Number(B || 0)) * dir
    if (sortKey === 'savedAt') {
      return (new Date(A || 0).getTime() - new Date(B || 0).getTime()) * dir
    }
    return String(A || '').localeCompare(String(B || ''), 'en') * dir
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const handleRemove = (index) => {
    const globalIndex = (page - 1) * pageSize + index
    if (window.confirm('Remove this study from your saved list?')) {
      removeStudy(globalIndex)
      setStudies(getSavedStudies())
      
      // Adjust page if needed
      const newTotal = studies.length - 1
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize))
      if (page > newTotalPages) setPage(newTotalPages)
    }
  }

  const handleClearAll = () => {
    if (window.confirm(`Remove all ${studies.length} saved studies?`)) {
      localStorage.removeItem('lotus-saved-studies')
      setStudies([])
      setPage(1)
    }
  }

  const handleExport = () => {
    exportToJSON(studies)
  }

  return (
    <div className='saved-studies'>
      {studies.length === 0 ? (
        <div className='saved-studies-empty'>
          <div className='saved-studies-empty__icon'>⭐</div>
          <div className='saved-studies-empty__title'>No Saved Studies Yet</div>
          <div className='saved-studies-empty__text'>
            Click the ☆ icon next to any study in search results to save it here
          </div>
        </div>
      ) : (
        <>
          <div className='saved-studies-header'>
            <div className='saved-studies-info'>
              <span className='saved-studies-count'>
                {studies.length} saved {studies.length === 1 ? 'study' : 'studies'}
              </span>
            </div>
            <div className='saved-studies-actions'>
              <button onClick={handleExport} className='saved-studies-btn saved-studies-btn--export'>
                📥 Export JSON
              </button>
              <button onClick={handleClearAll} className='saved-studies-btn saved-studies-btn--clear'>
                🗑️ Clear All
              </button>
            </div>
          </div>

          <div className='saved-studies-table-wrapper'>
            <table className='saved-studies-table'>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  {[
                    { key: 'savedAt', label: 'Saved', width: '140px' },
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
                      <span className='saved-studies-table__header'>
                        {label}
                        <span className='saved-studies-table__sort'>
                          {sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((study, i) => (
                  <tr key={i} className={classNames('saved-studies-table__row', i % 2 && 'saved-studies-table__row--alt')}>
                    <td>
                      <button
                        onClick={() => handleRemove(i)}
                        className='saved-studies-remove-btn'
                        title='Remove from saved'
                      >
                        ✕
                      </button>
                    </td>
                    <td className='saved-studies-table__date'>
                      {new Date(study.savedAt).toLocaleDateString()}
                    </td>
                    <td className='saved-studies-table__year'>{study.year ?? ''}</td>
                    <td className='saved-studies-table__journal'>{study.journal || ''}</td>
                    <td className='saved-studies-table__title'>
                      <div className='saved-studies-table__title-text' title={study.title}>
                        {study.title || ''}
                      </div>
                    </td>
                    <td className='saved-studies-table__authors'>{study.authors || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className='saved-studies-pagination'>
              <div className='saved-studies-pagination__info'>
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </div>
              <div className='saved-studies-pagination__controls'>
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(1)}
                  className='saved-studies-pagination__btn'
                >
                  ⏮
                </button>
                <button 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className='saved-studies-pagination__btn'
                >
                  Previous
                </button>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className='saved-studies-pagination__btn'
                >
                  Next
                </button>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(totalPages)}
                  className='saved-studies-pagination__btn'
                >
                  ⏭
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .saved-studies {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .saved-studies-empty {
          padding: 60px 20px;
          text-align: center;
          background: rgba(139, 157, 158, 0.08);
          border-radius: 12px;
        }

        .saved-studies-empty__icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .saved-studies-empty__title {
          font-size: 16px;
          font-weight: 600;
          color: var(--morandi-text);
          margin-bottom: 8px;
        }

        .saved-studies-empty__text {
          font-size: 13px;
          color: var(--morandi-text-muted);
          max-width: 400px;
          margin: 0 auto;
        }

        .saved-studies-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: linear-gradient(135deg, rgba(196, 181, 160, 0.15), rgba(155, 142, 130, 0.15));
          border-radius: 10px;
          border-left: 4px solid var(--morandi-warning);
        }

        .saved-studies-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .saved-studies-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--morandi-accent);
        }

        .saved-studies-actions {
          display: flex;
          gap: 8px;
        }

        .saved-studies-btn {
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .saved-studies-btn--export {
          background: var(--morandi-primary);
          color: white;
        }

        .saved-studies-btn--export:hover {
          background: var(--morandi-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(139, 157, 158, 0.3);
        }

        .saved-studies-btn--clear {
          background: transparent;
          color: var(--morandi-error);
          border: 1px solid var(--morandi-error);
        }

        .saved-studies-btn--clear:hover {
          background: var(--morandi-error);
          color: white;
        }

        .saved-studies-table-wrapper {
          overflow-x: auto;
          border: 1px solid var(--morandi-border);
          border-radius: 10px;
        }

        .saved-studies-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .saved-studies-table thead {
          background: linear-gradient(135deg, var(--morandi-warning), var(--morandi-accent));
          color: white;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .saved-studies-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          white-space: nowrap;
        }

        .saved-studies-table__header {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .saved-studies-table__sort {
          font-size: 10px;
          opacity: 0.8;
        }

        .saved-studies-table__row {
          border-bottom: 1px solid var(--morandi-border);
          transition: background 0.2s ease;
        }

        .saved-studies-table__row:hover {
          background: rgba(196, 181, 160, 0.1);
        }

        .saved-studies-table__row--alt {
          background: rgba(245, 243, 240, 0.5);
        }

        .saved-studies-table td {
          padding: 12px;
          vertical-align: top;
        }

        .saved-studies-table__date {
          font-size: 12px;
          color: var(--morandi-text-muted);
          white-space: nowrap;
        }

        .saved-studies-table__year {
          white-space: nowrap;
          font-weight: 600;
          color: var(--morandi-primary);
        }

        .saved-studies-table__journal {
          color: var(--morandi-text-muted);
        }

        .saved-studies-table__title-text {
          max-width: 500px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .saved-studies-table__authors {
          color: var(--morandi-text-muted);
          font-size: 12px;
        }

        .saved-studies-remove-btn {
          padding: 6px 10px;
          background: transparent;
          border: 1px solid var(--morandi-border);
          color: var(--morandi-error);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .saved-studies-remove-btn:hover {
          background: var(--morandi-error);
          color: white;
          border-color: var(--morandi-error);
          transform: scale(1.1);
        }

        .saved-studies-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(139, 157, 158, 0.05);
          border-radius: 10px;
          font-size: 13px;
        }

        .saved-studies-pagination__info {
          color: var(--morandi-text);
        }

        .saved-studies-pagination__controls {
          display: flex;
          gap: 8px;
        }

        .saved-studies-pagination__btn {
          padding: 8px 14px;
          background: white;
          border: 1px solid var(--morandi-border);
          color: var(--morandi-text);
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .saved-studies-pagination__btn:hover:not(:disabled) {
          background: var(--morandi-warning);
          color: white;
          border-color: var(--morandi-warning);
        }

        .saved-studies-pagination__btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
