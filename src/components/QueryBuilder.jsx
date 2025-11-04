export function QueryBuilder({ query, setQuery }) {
  const append = (token) => setQuery((q) => (q ? `${q} ${token}` : token));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setQuery(e.currentTarget.value);
    }
  };

  return (
    <div className="qb">
      <div className="qb__input-wrapper">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., emotion AND (memory OR attention) NOT [-22,-4,18]"
          className={`qb__input ${query ? 'qb__input--active' : ''}`}
        />
        {query && (
          <div className="qb__status">Active</div>
        )}
      </div>

      <div className="qb__operators">
        {[
          { label: 'AND', onClick: () => append('AND') },
          { label: 'OR', onClick: () => append('OR') },
          { label: 'NOT', onClick: () => append('NOT') },
          { label: '(', onClick: () => append('(') },
          { label: ')', onClick: () => append(')') },
        ].map((b) => (
          <button
            key={b.label}
            onClick={b.onClick}
            className="qb__btn"
          >
            {b.label}
          </button>
        ))}
        <button
          onClick={() => setQuery('')}
          className="qb__btn qb__btn--reset"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
