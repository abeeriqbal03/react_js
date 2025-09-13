import React from 'react';
import { loadJSON } from '../../utils.js';

export default function Events() {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const fetchEvents = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    loadJSON('/data/events.json')
      .then((res) => mounted && setList(res || []))
      .catch(() => mounted && setError('Could not load events.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    const cleanup = fetchEvents();
    return cleanup;
  }, [fetchEvents]);

  return (
    <div className="section-enter">
      <style>{`
        .event-card { border-radius: .75rem; transition: transform .2s, box-shadow .2s; }
        .event-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
        .event-date { font-size: .85rem; font-weight: 600; white-space: nowrap; }
        .event-title { font-weight: 600; }
        .event-details { color: var(--bs-secondary-color, #6c757d); }
        .event-img { max-height: 160px; object-fit: cover; width: 100%; border-radius: .5rem; }
        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.12), rgba(0,0,0,.06)); background-size:200% 100%; animation: sk 1.2s infinite; border-radius:.5rem; }
        @keyframes sk { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        .grid-tight > [class*='col-'] { display:flex; }
        .grid-tight .card { width:100%; }
        @media (max-width: 576px) {
          .event-details { font-size: .95rem; }
        }
        @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
      `}</style>

      <h2 className="h4 mb-3">📅 Events</h2>

      {loading ? (
        <div className="row g-3 grid-tight" aria-live="polite" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="card event-card h-100 p-3">
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
          <button className="btn btn-sm btn-outline-light" onClick={fetchEvents}>Retry</button>
        </div>
      ) : list.length === 0 ? (
        <div className="text-muted">No events listed.</div>
      ) : (
        <div className="row g-3 grid-tight">
          {list.map((e, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <article className="card event-card h-100 p-3" aria-label={e.title}>
                {e.image && (
                  <img
                    loading="lazy"
                    src={e.image}
                    alt={e.title || 'Event image'}
                    className="event-img mb-3"
                    onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h3 className="event-title h6 mb-0">{e.title}</h3>
                  <span className="badge bg-light text-dark border event-date">{e.date}</span>
                </div>
                <p className="event-details small mb-0">{e.details}</p>
                {e.link && (
                  <a href={e.link} className="btn btn-sm btn-outline-primary mt-3" aria-label={`Learn more about ${e.title}`}>
                    Learn More
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
