import React from 'react';
import { loadJSON } from '../../utils.js';

export default function VetDashboard() {
  const [data, setData] = React.useState({ cases: [], slots: { booked: [], available: [] } });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const form = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('fec_vetForm')) || null;
    } catch {
      return null;
    }
  }, []);

  const name = (form?.name || 'Dr. Example').trim();
  const specialization = form?.specialization || 'General';
  const image = form?.image || '';

  const initials = React.useMemo(() => {
    const n = name.replace(/^Dr\.\s*/i, '').trim();
    const parts = n ? n.split(/\s+/).slice(0, 2) : ['D', 'R'];
    return parts.map((p) => p?.[0]?.toUpperCase() || '').join('') || 'DR';
  }, [name]);

  
  function normalizeDashboard(res) {
    if (!res || typeof res !== 'object') {
      return { cases: [], slots: { booked: [], available: [] } };
    }

    
    const looksLikeDashboard =
      ('cases' in res || 'slots' in res) &&
      res.slots &&
      Array.isArray(res.slots.booked) &&
      Array.isArray(res.slots.available);

    if (looksLikeDashboard) {
      return {
        cases: Array.isArray(res.cases) ? res.cases : [],
        slots: {
          booked: Array.isArray(res.slots.booked) ? res.slots.booked : [],
          available: Array.isArray(res.slots.available) ? res.slots.available : [],
        },
      };
    }

   
    if (Array.isArray(res.vets)) {
      const booked = new Set();
      const available = new Set();

      res.vets.forEach((v) => {
        (v?.slots?.booked || []).forEach((t) => booked.add(String(t)));
        (v?.slots?.available || []).forEach((t) => available.add(String(t)));
      });

      const cases = res.vets.slice(0, 5).map((v) => ({
        title: `${v?.specialization || 'General'} — ${v?.name || 'Unknown Vet'}`,
        summary:
          `Experience: ${v?.experience || '—'} · ` +
          `Contact: ${v?.email || '—'} ${v?.phone ? '· ' + v.phone : ''}`.trim(),
        tags: [v?.location?.split(',')?.[0] || 'Clinic', (v?.specialization || 'General').split(' ')[0]],
      }));

      return {
        cases,
        slots: { booked: Array.from(booked), available: Array.from(available) },
      };
    }
    return { cases: [], slots: { booked: [], available: [] } };
  }

  const fetchData = React.useCallback(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    const tryPaths = ['/data/vet.json', '/data/vets.json'];

    (async () => {
      for (let i = 0; i < tryPaths.length; i++) {
        try {
          const res = await loadJSON(tryPaths[i]);
          if (!mounted) return;
          const normalized = normalizeDashboard(res);
          setData(normalized);
          setLoading(false);
          return; // success
        } catch (e) {
        }
      }
      if (mounted) {
        setError('Could not load dashboard data.');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    const cleanup = fetchData();
    return cleanup;
  }, [fetchData]);

  const bookedCount = data?.slots?.booked?.length || 0;
  const availableCount = data?.slots?.available?.length || 0;
  const total = bookedCount + availableCount;
  const utilization = total ? Math.round((bookedCount / total) * 100) : 0;

  return (
    <div className="section-enter">
      <style>{`
        .vd-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
        .vd-initials { width: 56px; height: 56px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:700; }
        .chip { border: 1px solid rgba(0,0,0,.1); padding: .25rem .5rem; border-radius: 999px; display:inline-flex; align-items:center; gap:.35rem; margin:.25rem; font-size:.85rem; white-space: nowrap; }
        .chips-scroll { display:flex; flex-wrap:wrap; }
        .muted { color: var(--bs-secondary-color, #6c757d); }
        .list-tight li { margin-bottom: .5rem; }
        .empty { border: 1px dashed rgba(0,0,0,.15); border-radius: .75rem; padding: 1rem; text-align: center; }
        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.12), rgba(0,0,0,.06)); background-size:200% 100%; animation: sk 1.2s infinite; border-radius:.5rem; }
        @keyframes sk { 0%{background-position:0% 0} 100%{background-position:200% 0} }

        .vd-head-actions { gap: .5rem; flex-wrap: wrap; justify-content: flex-end; }
        @media (max-width: 576px) {
          .vd-avatar, .vd-initials { width: 48px; height: 48px; }
          .vd-head-actions .btn { padding: .4rem .7rem; font-size: .9rem; }
          .chips-scroll { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
        }
        @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
      `}</style>

      <header className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          {image ? (
            <img src={image} alt={name} className="vd-avatar border" />
          ) : (
            <div className="vd-initials border bg-light" aria-label="Profile initials">
              {initials}
            </div>
          )}
          <div>
            <h2 className="h4 mb-0">Welcome back, {name} 👋</h2>
            <div className="small text-muted">{specialization} • Vet Dashboard</div>
          </div>
        </div>
        <div className="d-flex vd-head-actions">
          <a className="btn btn-outline-secondary" href="/vet/profile">Edit Profile</a>
          <a className="btn btn-primary" href="/vet/appointments">Manage Appointments</a>
        </div>
      </header>

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase small muted">Booked</div>
                <div className="h4 mb-0">{bookedCount}</div>
              </div>
              <span className="badge bg-primary-subtle text-primary border">Today</span>
            </div>
            <div className="progress mt-3" role="progressbar" aria-valuenow={utilization} aria-valuemin={0} aria-valuemax={100} aria-label="Utilization">
              <div className="progress-bar" style={{ width: `${utilization}%` }} />
            </div>
            <div className="small muted mt-1">Utilization: {utilization}%</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="text-uppercase small muted">Available</div>
            <div className="h4 mb-0">{availableCount}</div>
            <div className="small muted mt-2">Open slots that patients can book</div>
            <a href="/vet/appointments" className="btn btn-sm btn-outline-primary mt-2">Add/Adjust Slots</a>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-body h-100">
            <div className="text-uppercase small muted">Quick Actions</div>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <a className="btn btn-sm btn-outline-secondary" href="/vet/cases/new">➕ New Case</a>
              <a className="btn btn-sm btn-outline-secondary" href="/vet/patients">🐾 Patients</a>
              <a className="btn btn-sm btn-outline-secondary" href="/vet/messages">✉️ Messages</a>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card card-body h-100">
            <h6 className="mb-2">Appointment Slots</h6>

            {loading ? (
              <>
                <div className="skeleton" style={{height: 14, width: '60%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '80%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '50%'}} />
              </>
            ) : error ? (
              <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button className="btn btn-sm btn-outline-light" onClick={fetchData}>Retry</button>
              </div>
            ) : (
              <>
                <div className="small mb-1"><strong>Booked:</strong></div>
                <div className="chips-scroll">
                  {data.slots.booked.length ? (
                    data.slots.booked.map((t, i) => (
                      <span className="chip" key={`b-${i}`}>🗓️ {t}</span>
                    ))
                  ) : (
                    <div className="empty small muted w-100">No bookings yet.</div>
                  )}
                </div>

                <div className="small mt-3 mb-1"><strong>Available:</strong></div>
                <div className="chips-scroll">
                  {data.slots.available.length ? (
                    data.slots.available.map((t, i) => (
                      <span className="chip" key={`a-${i}`}>✅ {t}</span>
                    ))
                  ) : (
                    <div className="empty small muted w-100">No open slots. Add some from Manage Appointments.</div>
                  )}
                </div>

                <a className="btn btn-sm btn-outline-primary mt-3 align-self-start" href="/vet/appointments">Manage</a>
              </>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card card-body h-100">
            <h6 className="mb-2">Case Studies</h6>

            {loading ? (
              <>
                <div className="skeleton" style={{height: 16, width: '85%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '70%'}} />
                <div className="skeleton mt-3" style={{height: 16, width: '65%'}} />
                <div className="skeleton mt-2" style={{height: 14, width: '50%'}} />
              </>
            ) : error ? (
              <div className="alert alert-danger py-2 d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button className="btn btn-sm btn-outline-light" onClick={fetchData}>Retry</button>
              </div>
            ) : data.cases.length ? (
              <ul className="mb-0 list-unstyled list-tight">
                {data.cases.map((c, i) => (
                  <li key={i} className="border-bottom pb-2">
                    <div className="fw-semibold">{c.title}</div>
                    <div className="text-muted small">
                      {c.summary?.length > 140 ? c.summary.slice(0, 140) + '…' : c.summary || '—'}
                    </div>
                    {Array.isArray(c.tags) && c.tags.length ? (
                      <div className="mt-1 chips-scroll">
                        {c.tags.map((tag, ti) => (
                          <span key={ti} className="chip">#{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">
                <div className="mb-1">No case studies yet.</div>
                <a className="btn btn-sm btn-outline-secondary" href="/vet/cases/new">Add First Case</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
