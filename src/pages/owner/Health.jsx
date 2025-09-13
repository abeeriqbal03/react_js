import React from "react";
import { loadJSON } from "../../utils.js";


export default function Health({ dataUrl = "/data/tips.json" }) {
  const [tips, setTips] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [sort, setSort] = React.useState("az");
  const [activeCat, setActiveCat] = React.useState("");

  const searchRef = React.useRef(null);

  const fetchTips = React.useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loadJSON(dataUrl)
      .then((data) => {
        if (cancelled) return;
        const arr = Array.isArray(data?.health) ? data.health : [];
        const safe = arr.map((x, i) => ({
          id: x?.id ?? `tip-${i}`,
          title: String(x?.title ?? "Untitled"),
          content: String(x?.content ?? "No details"),
          category: String(x?.category ?? "General"),
        }));
        setTips(safe);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError("Failed to load health tips.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dataUrl]);

  React.useEffect(() => {
    const cleanup = fetchTips();
    return cleanup;
  }, [fetchTips]);

    React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [q]);

  
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = searchRef.current; if (el) { e.preventDefault(); el.focus(); }
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQ('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categories = React.useMemo(() => {
    const map = new Map();
    for (const t of tips) map.set(t.category, (map.get(t.category) || 0) + 1);
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name));
  }, [tips]);

  const filtered = React.useMemo(() => {
    const qOk = (s) => (debouncedQ ? String(s).toLowerCase().includes(debouncedQ) : true);
    let arr = tips.filter((t) => {
      const hit = qOk(t.title) || qOk(t.content) || qOk(t.category);
      const catOk = !activeCat || t.category === activeCat;
      return hit && catOk;
    });
    switch (sort) {
      case "za": arr.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "az": default: arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [tips, debouncedQ, activeCat, sort]);

  const Skeleton = () => (
    <div className="col-md-6 col-lg-4">
      <div className="card h-100 placeholder-glow">
        <div className="card-body">
          <h5 className="card-title placeholder col-6" />
          <p className="card-text placeholder col-12" />
          <p className="card-text placeholder col-10" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="section-enter">
      <style>{`
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
        .chip-btn { border: 1px solid rgba(0,0,0,.12); background:#fff; padding: .25rem .6rem; border-radius: 999px; font-size:.85rem; }
        .chip-btn[aria-checked='true'] { background:#000; color:#fff; border-color:#000; font-weight:700; }
        .controls { gap:.5rem; flex-wrap: wrap; }
        .chip-bar { display:flex; gap:.4rem; flex-wrap: wrap; }
        @media (max-width: 576px) {
          .controls { align-items: stretch !important; }
          .chip-bar { overflow-x:auto; flex-wrap:nowrap; -webkit-overflow-scrolling:touch; scrollbar-width: thin; }
          .chip-bar > * { flex: 0 0 auto; }
        }
        @media (prefers-reduced-motion: reduce) { .card-hover { transition: none; } }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap controls">
        <h2 className="h4 m-0">Health Tips</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="input-group input-group-sm" style={{ maxWidth: 260 }}>
            <span className="input-group-text" id="tip-search">🔎</span>
            <input
              ref={searchRef}
              className="form-control form-control-sm"
              placeholder="Search tips… ( / )"
              aria-label="Search health tips"
              aria-describedby="tip-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button className="btn btn-outline-secondary" onClick={() => setQ("")} aria-label="Clear search">✕</button>
            )}
          </div>
          <select className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort tips">
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
          </select>
          {(q || activeCat || sort !== 'az') && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQ(''); setDebouncedQ(''); setActiveCat(''); setSort('az'); }}>Reset</button>
          )}
        </div>
      </div>

      
      {categories.length > 0 && (
        <div className="mb-3 chip-bar" role="radiogroup" aria-label="Filter by category">
          <button type="button" className="chip-btn" aria-checked={activeCat === ''} role="radio" onClick={() => setActiveCat("")}>All ({tips.length})</button>
          {categories.map((c) => (
            <button key={c.name} type="button" className="chip-btn" aria-checked={activeCat === c.name} role="radio" onClick={() => setActiveCat(c.name)}>
              {c.name} ({c.count})
            </button>
          ))}
        </div>
      )}

      
      <div className="small text-muted mb-2" aria-live="polite">
        {loading ? 'Loading tips…' : error ? (
          <span className="text-danger d-inline-flex align-items-center gap-2">
            {error}
            <button className="btn btn-sm btn-outline-danger" onClick={fetchTips}>Retry</button>
          </span>
        ) : (
          <>Showing <strong>{filtered.length}</strong> tip{s => filtered.length === 1 ? '' : 's'}{activeCat ? <> in <span className="badge bg-light text-dark border">{activeCat}</span></> : null}{debouncedQ ? <> for <span className="badge bg-light text-dark border">{debouncedQ}</span></> : null}</>
        )}
      </div>

      {loading && (
        <div className="row g-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-muted">No tips available.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="row g-3">
          {filtered.map((x) => (
            <div className="col-md-6 col-lg-4" key={x.id}>
              <div className="card h-100 card-hover">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title mb-2 h6">{x.title}</h5>
                  <p className="card-text text-muted small flex-grow-1">{x.content}</p>
                  <div className="mt-2">
                    <span className="badge bg-light text-dark border">{x.category}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
