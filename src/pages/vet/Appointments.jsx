import React from 'react';
import { AppCtx } from '../../App.jsx';

export default function VetAppointments() {
  const { bookings, bookSlot, cancelBooking } = React.useContext(AppCtx);

  
  const todayStr = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [slot, setSlot] = React.useState('09:00');
  const [date, setDate] = React.useState(todayStr);
  const [status, setStatus] = React.useState({ type: '', msg: '' }); // 'success' | 'danger' | ''
  const [filter, setFilter] = React.useState('all'); // all | today | upcoming

  
  const SLOT_OPTIONS = ['09:00', '11:00', '14:00', '16:00', '18:00'];

  const isPastDate = (dStr) => {
    try {
      const d = new Date(dStr);
      const t = new Date();
      const nd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const nt = new Date(t.getFullYear(), t.getMonth(), t.getDate());
      return nd < nt;
    } catch {
      return false;
    }
  };

  const duplicateExists = (dStr, s) => bookings?.some((b) => b.date === dStr && b.slot === s);

  const clearStatusSoon = () => setTimeout(() => setStatus({ type: '', msg: '' }), 2500);

  
  const sorted = React.useMemo(() => {
    const toKey = (b) => `${b.date} ${b.slot}`;
    return [...(bookings || [])].sort((a, b) => (toKey(a) > toKey(b) ? 1 : -1));
  }, [bookings]);

  const visible = React.useMemo(() => {
    const tStr = todayStr;
    if (filter === 'today') return sorted.filter((b) => b.date === tStr);
    if (filter === 'upcoming') return sorted.filter((b) => b.date >= tStr);
    return sorted;
  }, [sorted, filter, todayStr]);

  const canBook = Boolean(date && SLOT_OPTIONS.includes(slot) && !isPastDate(date) && !duplicateExists(date, slot));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!date) return;
    if (isPastDate(date)) {
      setStatus({ type: 'danger', msg: 'You cannot book a slot in the past.' });
      return clearStatusSoon();
    }
    if (!SLOT_OPTIONS.includes(slot)) {
      setStatus({ type: 'danger', msg: 'Please select a valid time slot.' });
      return clearStatusSoon();
    }
    if (duplicateExists(date, slot)) {
      setStatus({ type: 'danger', msg: 'This date & time is already booked.' });
      return clearStatusSoon();
    }
    bookSlot(slot, date);
    setStatus({ type: 'success', msg: '✅ Appointment booked!' });
    clearStatusSoon();
  };

  const onCancel = (i) => {
    if (window.confirm('Cancel this appointment?')) cancelBooking(i);
  };

  return (
    <div className="section-enter">
      
      <style>{`
        .chip { border: 1px solid rgba(0,0,0,.1); padding: .25rem .5rem; border-radius: 999px; display:inline-flex; align-items:center; gap:.35rem; margin:.25rem; font-size:.85rem; }
        .empty { border: 1px dashed rgba(0,0,0,.15); border-radius: .75rem; padding: 1rem; text-align: center; color: var(--bs-secondary-color, #6c757d); }
        .va-quick { display:flex; flex-wrap: wrap; gap:.5rem; }
        .va-filter { display:flex; align-items:center; gap:.5rem; flex-wrap: wrap; }
        .va-list .list-group-item { flex-wrap: wrap; }
        .va-list .badge { font-weight: 600; }
        @media (max-width: 576px) {
          .va-quick .btn { padding:.35rem .6rem; font-size:.85rem; }
          .va-filter select { width: 140px; }
        }
        @media (prefers-reduced-motion: reduce) { .alert { transition: none !important; } }
      `}</style>

      <h2 className="h4 mb-3">Appointments</h2>

      {status.type && (
        <div className={`alert alert-${status.type} mb-3 py-2`} role="alert" aria-live="polite">{status.msg}</div>
      )}

      <form className="card card-body mb-3" onSubmit={onSubmit} noValidate>
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label" htmlFor="vaSlot">Time Slot</label>
            <select id="vaSlot" className="form-select" value={slot} onChange={(e) => setSlot(e.target.value)}>
              {SLOT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="va-quick mt-2" aria-label="Quick slot picks">
              {SLOT_OPTIONS.slice(0, 3).map((s) => (
                <button type="button" key={`q-${s}`} className={`btn btn-sm ${slot===s ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setSlot(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="col-md-4">
            <label className="form-label" htmlFor="vaDate">Date</label>
            <input id="vaDate" className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} required min={todayStr} />
            <div className="d-flex gap-2 mt-2 va-quick">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setDate(todayStr)}>Today</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
                const d = new Date(); d.setDate(d.getDate()+1); setDate(d.toISOString().slice(0,10));
              }}>Tomorrow</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {
                const d = new Date(); d.setDate(d.getDate()+7); setDate(d.toISOString().slice(0,10));
              }}>+1 Week</button>
            </div>
          </div>

          <div className="col-md-4">
            <button className="btn btn-primary w-100" disabled={!canBook} aria-disabled={!canBook}>Book</button>
            <div className="small text-muted mt-2">Stored in your browser.</div>
          </div>
        </div>
      </form>

      <div className="card card-body">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h6 className="fw-bold mb-0">Your Bookings</h6>
          <div className="va-filter">
            <span className="small text-muted">Filter:</span>
            <select className="form-select form-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
            </select>
            <span className="chip">Total: <strong>{visible.length}</strong></span>
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="empty">No bookings yet.</div>
        ) : (
          <ul className="list-group va-list">
            {visible.map((b, i) => (
              <li key={`${b.date}-${b.slot}-${i}`} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <span className="me-2">🗓️ {b.date}</span>
                  <span className="badge bg-primary-subtle text-primary border">{b.slot}</span>
                </span>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel(i)} aria-label={`Cancel appointment on ${b.date} at ${b.slot}`}>Cancel</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
