import React from 'react';
import { loadJSON } from '../../utils.js';

export default function Training() {
  const [tips, setTips] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [query, setQuery] = React.useState('');

  const fetchTips = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    loadJSON('/data/tips.json')
      .then((data) => {
        if (!mounted) return;
        setTips(data?.training || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError('⚠️ Failed to load training tips.');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = fetchTips();
    return cleanup;
  }, [fetchTips]);

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Copied!'); } catch {}
  };

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tips;
    return tips.filter((t) =>
      [t?.title, t?.content].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [tips, query]);

  return (
    <div className="section-enter">
      <style>{`
        .tip-card { border: 1px solid rgba(0,0,0,.08); border-radius: .75rem; padding: 1rem; margin-bottom: 1rem; transition: transform .2s, box-shadow .2s; background: #fff; }
        .tip-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
        .tip-title { font-weight: 600; color: #333; }
        .tip-content { color: #555; font-size: 0.9rem; }
        .tip-actions { display:flex; gap:.5rem; flex-wrap: wrap; }
        .controls { gap:.5rem; flex-wrap: wrap; }
        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.12), rgba(0,0,0,.06)); background-size:200% 100%; animation: sk 1.2s infinite; border-radius:.5rem; }
        @keyframes sk { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @media (max-width: 576px) { .tip-content { font-size: .95rem; } .controls { align-items: stretch !important; } }
        @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 controls">
        <h2 className="h4 m-0">🐶 Training Tips</h2>
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text">🔎</span>
          <input
            className="form-control"
            placeholder="Search title or tip text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search training tips"
          />
        </div>
      </div>

      {loading ? (
        <div aria-live="polite" aria-busy="true">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="tip-card">
              <div className="skeleton" style={{height: 18, width: '60%'}} />
              <div className="skeleton mt-2" style={{height: 14, width: '95%'}} />
              <div className="skeleton mt-2" style={{height: 14, width: '75%'}} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-light" onClick={fetchTips}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted fst-italic">No training tips found.</div>
      ) : (
        <div>
          {filtered.map((x, i) => (
            <article className="tip-card" key={i} aria-label={x.title}>
              <div className="d-flex justify-content-between align-items-start gap-2">
                <h3 className="tip-title h6 mb-1">{x.title}</h3>
                <div className="tip-actions">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => copy(`${x.title}\n\n${x.content}`)}>Copy</button>
                </div>
              </div>
              <p className="tip-content mb-0">{x.content}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
