import React from 'react';
import { AppCtx } from '../../App.jsx';

export default function AdoptionForm() {
  const { adoptions = [], submitAdoption, deleteAdoption } = React.useContext(AppCtx);

  const empty = { fullName: '', email: '', phone: '', petId: '', notes: '' };
  const [f, setF] = React.useState(empty);
  const [status, setStatus] = React.useState({ type: '', msg: '' });
  const [touched, setTouched] = React.useState({});
  const [consent, setConsent] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const MAX_NOTES = 600;
  const DRAFT_KEY = 'fec_adoption_draft';

  
  const safeLS = {
    get: (k, fb = null) => { try { if (typeof window === 'undefined') return fb; const v = window.localStorage.getItem(k); return v ?? fb; } catch { return fb; } },
    set: (k, v) => { try { if (typeof window === 'undefined') return; window.localStorage.setItem(k, v); } catch {} },
    rm: (k) => { try { if (typeof window === 'undefined') return; window.localStorage.removeItem(k); } catch {} },
  };

  
  React.useEffect(() => {
    const raw = safeLS.get(DRAFT_KEY, '');
    if (raw) {
      try {
        const d = JSON.parse(raw);
        if (d && typeof d === 'object') {
          setF(d.f ?? empty);
          setConsent(Boolean(d.consent));
        }
      } catch {/* ignore */}
    }
  }, []);

  
  const draftTimer = React.useRef(null);
  React.useEffect(() => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      safeLS.set(DRAFT_KEY, JSON.stringify({ f, consent }));
    }, 500);
    return () => draftTimer.current && clearTimeout(draftTimer.current);
  }, [f, consent]);

    const isEmail = (v) => /\S+@\S+\.\S+/.test(v || '');
  const isPhone = (v) => !v || /[0-9+()\-\s]{7,}/.test(v || '');
  const isPetId = (v) => String(v || '').trim().length > 0;

  const errors = {
    fullName: !f.fullName ? 'Full name is required' : '',
    email: !f.email ? 'Email is required' : !isEmail(f.email) ? 'Enter a valid email' : '',
    phone: !isPhone(f.phone) ? 'Enter a valid phone' : '',
    petId: !isPetId(f.petId) ? 'Pet ID is required' : '',
    notes: f.notes && f.notes.length > MAX_NOTES ? `Keep under ${MAX_NOTES} characters` : '',
    consent: !consent ? 'Please accept the privacy notice' : '',
  };

  const hasErrors = () =>
    Boolean(errors.fullName || errors.email || errors.phone || errors.petId || errors.notes || errors.consent);

  const fieldClass = (k) =>
    touched[k] && errors[k] ? 'is-invalid'
      : touched[k] && !errors[k] ? 'is-valid'
      : '';

  const markTouched = (k) => setTouched((t) => ({ ...t, [k]: true }));

  
  const statusTimer = React.useRef(null);
  const showMsg = (type, msg, timeout = 3000) => {
    setStatus({ type, msg });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    if (timeout) {
      statusTimer.current = setTimeout(() => setStatus({ type: '', msg: '' }), timeout);
    }
  };
  React.useEffect(() => () => statusTimer.current && clearTimeout(statusTimer.current), []);

  const focusFirstError = () => {
    const order = ['fullName', 'email', 'phone', 'petId', 'notes', 'consent'];
    const idMap = {
      fullName: 'afName',
      email: 'afEmail',
      phone: 'afPhone',
      petId: 'afPetId',
      notes: 'afNotes',
      consent: 'afConsent',
    };
    for (const k of order) {
      if (errors[k]) {
        const el = document.getElementById(idMap[k]);
        if (el && el.focus) el.focus();
        break;
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, phone: true, petId: true, notes: true, consent: true });
    if (hasErrors()) {
      showMsg('danger', 'Please fix the highlighted fields.');
      focusFirstError();
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: f.fullName.trim(),
        email: f.email.trim(),
        phone: (f.phone || '').trim(),
        petId: String(f.petId).trim(),
        notes: (f.notes || '').trim(),
        createdAt: new Date().toISOString(),
      };
      if (typeof submitAdoption === 'function') {
        await Promise.resolve(submitAdoption(payload));
      }
      setF(empty);
      setConsent(false);
      setTouched({});
      safeLS.rm(DRAFT_KEY);
      showMsg('success', '✅ Application submitted!');
    } catch (err) {
      showMsg('danger', 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = (i) => {
    const a = adoptions[i];
    const label = a ? ` for ${a.fullName || 'applicant'} (Pet ${a.petId ?? '—'})` : '';
    if (window.confirm(`Delete this application${label}?`)) {
      if (typeof deleteAdoption === 'function') {
        deleteAdoption(i);
      }
      showMsg('info', 'Application deleted.');
    }
  };

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  const remaining = Math.max(0, MAX_NOTES - (f.notes?.length || 0));
  const usedPct = Math.min(100, Math.max(0, ((f.notes?.length || 0) / MAX_NOTES) * 100));

  const filtered = React.useMemo(() => {
    const list = Array.isArray(adoptions) ? adoptions.slice() : [];
  
    list.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)));
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) =>
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      String(a.petId || '').toLowerCase().includes(q)
    );
  }, [adoptions, search]);

  return (
    <div className="section-enter">
      <style>{`
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,.10); }
        .empty { border: 1px dashed rgba(0,0,0,.15); border-radius: .75rem; padding: 1rem; text-align:center; color: var(--bs-secondary-color, #6c757d); }
        .chip { border: 1px solid rgba(0,0,0,.1); padding: .2rem .5rem; border-radius: 999px; margin-left: .5rem; font-size: .75rem; }
        .countbar { height: 6px; width: 100%; background: rgba(0,0,0,.08); border-radius: 999px; overflow: hidden; }
        .countbar > span { display:block; height:100%; background: linear-gradient(90deg, #06b6d4, #7c3aed); }
        .alert-dark-custom { background-color: #000 !important; color: #fff !important; border: none !important; }
        .controls { gap:.5rem; flex-wrap: wrap; }
        details > summary { cursor: pointer; }
        @media (max-width: 576px) {
          .controls .form-control { width: 100% !important; }
          .controls { align-items: stretch !important; }
        }
        @media (prefers-reduced-motion: reduce) { .alert { transition: none !important; } }
      `}</style>

      <h2 className="h4 mb-3">🐾 Adoption Application</h2>

      {status.type && (
        <div className={`alert alert-dark-custom mb-3 py-2`} role="alert" aria-live="polite">{status.msg}</div>
      )}

      
      <form className="card card-body card-hover mb-3" onSubmit={onSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="afName">Full Name *</label>
            <input
              id="afName"
              className={`form-control ${fieldClass('fullName')}`}
              placeholder="Aisha Khan"
              value={f.fullName}
              onBlur={() => markTouched('fullName')}
              onChange={(e) => setF({ ...f, fullName: e.target.value })}
              required
              aria-invalid={!!(touched.fullName && errors.fullName)}
            />
            {touched.fullName && errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="afEmail">Email *</label>
            <input
              id="afEmail"
              type="email"
              className={`form-control ${fieldClass('email')}`}
              placeholder="you@example.com"
              value={f.email}
              onBlur={() => markTouched('email')}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              required
              inputMode="email"
              autoComplete="email"
              aria-invalid={!!(touched.email && errors.email)}
            />
            {touched.email && errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="afPhone">Phone</label>
            <input
              id="afPhone"
              className={`form-control ${fieldClass('phone')}`}
              placeholder="+92 300 1234567"
              value={f.phone}
              onBlur={() => markTouched('phone')}
              onChange={(e) => setF({ ...f, phone: e.target.value })}
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={!!(touched.phone && errors.phone)}
            />
            {touched.phone && errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="afPetId">Pet ID *</label>
            <input
              id="afPetId"
              className={`form-control ${fieldClass('petId')}`}
              placeholder="e.g. 101"
              value={f.petId}
              onBlur={() => markTouched('petId')}
              onChange={(e) => setF({ ...f, petId: e.target.value })}
              required
              aria-invalid={!!(touched.petId && errors.petId)}
            />
            {touched.petId && errors.petId && <div className="invalid-feedback">{errors.petId}</div>}
          </div>

          <div className="col-12">
            <label className="form-label" htmlFor="afNotes">Why would you be a good match?</label>
            <textarea
              id="afNotes"
              className={`form-control ${fieldClass('notes')}`}
              rows={4}
              value={f.notes}
              onBlur={() => markTouched('notes')}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
              maxLength={MAX_NOTES}
              aria-describedby="afNotesHelp"
              aria-invalid={!!(touched.notes && errors.notes)}
            />
            <div className="d-flex justify-content-between align-items-center mt-1 gap-2 flex-wrap">
              {touched.notes && errors.notes ? (
                <div className="invalid-feedback d-block">{errors.notes}</div>
              ) : (
                <small id="afNotesHelp" className="text-muted">{remaining} characters left</small>
              )}
              <div className="countbar"><span style={{ width: `${usedPct}%` }} /></div>
            </div>
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className={`form-check-input ${touched.consent && errors.consent ? 'is-invalid' : ''}`}
                type="checkbox"
                id="afConsent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                onBlur={() => markTouched('consent')}
                required
                aria-describedby="afConsentHelp"
                aria-invalid={!!(touched.consent && errors.consent)}
              />
              <label className="form-check-label" htmlFor="afConsent">
                I agree that my information will be shared with the shelter for this application.
              </label>
              <div id="afConsentHelp" className="form-text">We take your privacy seriously and only use this data for adoption processing.</div>
              {touched.consent && errors.consent && <div className="invalid-feedback d-block">{errors.consent}</div>}
            </div>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <button className="btn btn-primary" disabled={hasErrors() || submitting} aria-disabled={hasErrors() || submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              if (window.confirm('Clear the form?')) {
                setF(empty); setTouched({}); setConsent(false); safeLS.rm(DRAFT_KEY);
                showMsg('info', 'Form cleared.');
              }
            }}
          >
            Reset
          </button>
        </div>
      </form>

      
      <div className="card card-body">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 controls">
          <h6 className="fw-bold mb-0">Submitted Applications</h6>
          <span className="chip bg-light">Total: <strong>{adoptions.length}</strong></span>
          <input
            className="form-control form-control-sm"
            style={{ maxWidth: 250 }}
            placeholder="Search by name, email or Pet ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications by name, email or Pet ID"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty">No applications yet{adoptions.length ? ' match your filter.' : '.'}</div>
        ) : (
          <div className="row g-3">
            {filtered.map((a, i) => (
              <div key={(a.createdAt || '') + i} className="col-md-6 col-lg-4">
                <div className="card card-hover h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h6 className="fw-semibold mb-1">
                      {a.fullName}{' '}
                      <span className="badge bg-primary-subtle text-primary border ms-1">
                        Pet {a.petId}
                      </span>
                    </h6>
                    <div className="small text-muted mb-2">
                      {a.email}{a.phone ? ` • ${a.phone}` : ''}<br/>
                      {a.createdAt && <span>{formatDate(a.createdAt)}</span>}
                    </div>

                    {a.notes && (
                      <details className="small mb-2">
                        <summary className="text-primary">View notes</summary>
                        <div className="mt-1 text-body-secondary">{a.notes}</div>
                      </details>
                    )}

                    <div className="mt-auto d-flex justify-content-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(i)}
                        aria-label={`Delete application for Pet ${a.petId}`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
