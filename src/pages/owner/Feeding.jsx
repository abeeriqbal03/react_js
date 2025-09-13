import React from "react";
import { loadJSON } from "../../utils.js";

export default function OwnerFeeding({ dataUrl = "/data/feeding.json" }) {
  const [data, setData] = React.useState({ dogs: [], cats: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  // UI state
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [activeStage, setActiveStage] = React.useState("");
  const [sort, setSort] = React.useState("none"); // none | stageAz | stageZa

  const searchRef = React.useRef(null);

  // --- fetch ---
  const fetchFeed = React.useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    loadJSON(dataUrl)
      .then((res) => {
        if (cancelled) return;
        const dogs = Array.isArray(res?.dogs) ? res.dogs : [];
        const cats = Array.isArray(res?.cats) ? res.cats : [];
        setData({ dogs, cats });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError("Failed to load feeding guide.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [dataUrl]);

  React.useEffect(() => {
    const cleanup = fetchFeed();
    return cleanup;
  }, [fetchFeed]);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [q]);

  // keyboard QoL: "/" to focus, Esc to clear
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = searchRef.current; if (el) { e.preventDefault(); el.focus(); }
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        setQ("");
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // stages (chips)
  const stages = React.useMemo(() => {
    const set = new Set();
    [...data.dogs, ...data.cats].forEach((r) => { if (r?.stage) set.add(String(r.stage)); });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data]);

  // helpers
  const matches = (r) => {
    const qOk = (s) => (debouncedQ ? String(s || '').toLowerCase().includes(debouncedQ) : true);
    const stageOk = !activeStage || String(r?.stage) === activeStage;
    return stageOk && (qOk(r?.stage) || qOk(r?.notes) || qOk(r?.daily_meals));
  };

  const sortRows = (rows) => {
    if (sort === 'stageAz') return [...rows].sort((a,b) => String(a?.stage||'').localeCompare(String(b?.stage||'')));
    if (sort === 'stageZa') return [...rows].sort((a,b) => String(b?.stage||'').localeCompare(String(a?.stage||'')));
    return rows;
  };

  const dogsFiltered = sortRows((data.dogs || []).filter(matches));
  const catsFiltered = sortRows((data.cats || []).filter(matches));

  const Table = ({ title, rows, isFiltered }) => (
    <div className="card card-body h-100 card-hover">
      <h6 className="mb-2">{title}</h6>
      {rows.length === 0 ? (
        <p className="text-muted mb-0">{isFiltered ? 'No matches for your filters.' : 'No data available.'}</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm align-middle">
            <caption className="text-muted small">
              Typical guidance — always adjust to vet advice.
            </caption>
            <thead className="table-light">
              <tr>
                <th scope="col">Life stage</th>
                <th scope="col">Daily meals</th>
                <th scope="col" className="d-none d-sm-table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th scope="row">{r?.stage ?? "—"}</th>
                  <td>{r?.daily_meals ?? "—"}</td>
                  <td className="small text-muted d-none d-sm-table-cell">{r?.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
        <h2 className="h4 m-0">Feeding Guide</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
            <span className="input-group-text" id="feed-search">🔎</span>
            <input
              ref={searchRef}
              className="form-control form-control-sm"
              placeholder="Search stage, meals or notes… ( / )"
              aria-label="Search feeding guide"
              aria-describedby="feed-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button className="btn btn-outline-secondary" onClick={() => setQ("")} aria-label="Clear search">✕</button>
            )}
          </div>
          <select className="form-select form-select-sm" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by stage">
            <option value="none">Sort: Default</option>
            <option value="stageAz">Sort: Stage A–Z</option>
            <option value="stageZa">Sort: Stage Z–A</option>
          </select>
          {(q || activeStage || sort !== 'none') && (
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { setQ(''); setDebouncedQ(''); setActiveStage(''); setSort('none'); }}>Reset</button>
          )}
        </div>
      </div>

      {/* Stage chips */}
      {stages.length > 0 && (
        <div className="mb-3 chip-bar" role="radiogroup" aria-label="Filter by life stage">
          <button type="button" className="chip-btn" aria-checked={activeStage === ''} role="radio" onClick={() => setActiveStage("")}>All ({data.dogs.length + data.cats.length})</button>
          {stages.map((s) => (
            <button key={s} type="button" className="chip-btn" aria-checked={activeStage === s} role="radio" onClick={() => setActiveStage(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Status line */}
      <div className="small text-muted mb-2" aria-live="polite">
        {loading ? 'Loading…' : error ? (
          <span className="text-danger d-inline-flex align-items-center gap-2">
            {error}
            <button className="btn btn-sm btn-outline-danger" onClick={fetchFeed}>Retry</button>
          </span>
        ) : (
          <>Showing <strong>{dogsFiltered.length}</strong> dog row{dogsFiltered.length === 1 ? '' : 's'} and <strong>{catsFiltered.length}</strong> cat row{catsFiltered.length === 1 ? '' : 's'}{activeStage ? <> in <span className="badge bg-light text-dark border">{activeStage}</span></> : null}{debouncedQ ? <> for <span className="badge bg-light text-dark border">{debouncedQ}</span></> : null}</>
        )}
      </div>

      {loading && <p className="text-muted" aria-busy="true">Loading…</p>}
      {!loading && error && <p className="text-danger">{error}</p>}

      {!loading && !error && (
        <div className="row g-3">
          <div className="col-lg-6">
            <Table title="Dogs" rows={dogsFiltered} isFiltered={Boolean(q || activeStage || sort !== 'none')} />
          </div>
          <div className="col-lg-6">
            <Table title="Cats" rows={catsFiltered} isFiltered={Boolean(q || activeStage || sort !== 'none')} />
          </div>
        </div>
      )}
    </div>
  );
}
