import React from 'react';
import { loadJSON } from '../../utils.js';

export default function Stories() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchStories = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    loadJSON('/data/stories.json')
      .then((res) => mounted && setList(res || []))
      .catch(() => mounted && setError('Could not load stories.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const cleanup = fetchStories();
    return cleanup;
  }, [fetchStories]);

  return (
    <div className="section-enter">
      <style>{`
        .story-card { border-radius: .75rem; transition: transform .2s, box-shadow .2s; }
        .story-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .story-title { font-weight: 600; }
        .story-text { color: var(--bs-secondary-color, #6c757d); }
        .story-img { max-height: 160px; object-fit: cover; width: 100%; border-radius: .5rem; }
        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.12), rgba(0,0,0,.06)); background-size:200% 100%; animation: sk 1.2s infinite; border-radius:.5rem; }
        @keyframes sk { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        .grid-tight > [class*='col-'] { display:flex; }
        .grid-tight .card { width:100%; }
        @media (max-width: 576px) {
          .story-text { font-size: .95rem; }
        }
        @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
      `}</style>

      <h2 className="h4 mb-3">🌟 Success Stories</h2>

      {loading ? (
        <div className="row g-3 grid-tight" aria-live="polite" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="card story-card h-100 p-3">
                <div className="skeleton mb-3" style={{height: 160}} />
                <div className="skeleton" style={{height: 16, width: '80%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '95%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '70%'}} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-light" onClick={fetchStories}>Retry</button>
        </div>
      ) : list.length === 0 ? (
        <div className="text-muted">No stories available yet.</div>
      ) : (
        <div className="row g-3 grid-tight">
          {list.map((s, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <article className="card story-card h-100 p-3" aria-label={s.title}>
                {s.image && (
                  <img
                    loading="lazy"
                    src={s.image}
                    alt={s.title || 'Story image'}
                    className="story-img mb-3"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <h3 className="story-title mb-1 h6">{s.title}</h3>
                <p className="story-text small mb-0">
                  {s.text?.length > 140 ? s.text.slice(0, 140) + '…' : s.text}
                </p>
                {s.link && (
                  <a href={s.link} className="btn btn-sm btn-outline-primary mt-3" aria-label={`Read more about ${s.title}`}>
                    Read More
                  </a>
                )}
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
