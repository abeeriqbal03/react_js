import React from 'react';
import { AppCtx } from '../../App.jsx';

const LS_KEY = "PET_PROFILE";
const LS_LIST_KEY = "PET_PROFILE_LIST";

export default function OwnerProfile() {
  const { petName, setPetName } = React.useContext(AppCtx);

  const DEFAULT_FORM = {
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    vaccines: 'Yes',
  };

  const [form, setForm] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || DEFAULT_FORM;
    } catch {
      return DEFAULT_FORM;
    }
  });
  const [touched, setTouched] = React.useState({});
  const [status, setStatus] = React.useState({ type: '', msg: '' });
  const [savedProfiles, setSavedProfiles] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_LIST_KEY)) || [];
    } catch {
      return [];
    }
  });

  const speciesIcons = { Dog: '🐶', Cat: '🐱', Rabbit: '🐰' };
  const avatarEmoji = speciesIcons[form.species] || '🐾';

  const isAgeOk = (v) => v === '' || (/^\d{1,2}$/.test(String(v)) && Number(v) <= 40);
  const hasErrors = () => Boolean((!form.name && touched.name) || (!isAgeOk(form.age) && touched.age));

  const fieldClass = (key, error) =>
    touched[key] && error ? 'is-invalid' : touched[key] && !error ? 'is-valid' : '';

  const showMsg = (type, msg, timeout = 2500) => {
    setStatus({ type, msg });
    if (timeout) {
      clearTimeout(showMsg._t);
      showMsg._t = setTimeout(() => setStatus({ type: '', msg: '' }), timeout);
    }
  };

  React.useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(form));
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [form]);

  React.useEffect(() => {
    if (form.name && form.name !== petName) setPetName(form.name);
  }, [form.name]);

  const save = () => {
    try {
      // ek profile save
      localStorage.setItem(LS_KEY, JSON.stringify(form));

      // list me add karna
      const updatedProfiles = [...savedProfiles, form];
      setSavedProfiles(updatedProfiles);
      localStorage.setItem(LS_LIST_KEY, JSON.stringify(updatedProfiles));

      setPetName(form.name);
      showMsg('success', '✅ Saved locally!');
    } catch {
      showMsg('danger', '⚠️ Could not save to this browser.');
    }
  };

  const reset = () => {
    const dirty = JSON.stringify(form) !== JSON.stringify(DEFAULT_FORM);
    if (!dirty || window.confirm('Clear local profile?')) {
      localStorage.removeItem(LS_KEY);
      setForm(DEFAULT_FORM);
      setPetName('');
      setTouched({});
      showMsg('info', 'Draft cleared.');
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    save();
  };

  React.useEffect(() => {
    const onKey = (e) => {
      const isSaveCombo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      if (isSaveCombo) {
        e.preventDefault();
        if (!hasErrors() && form.name) save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [form, touched, savedProfiles]);

  const nameError = !form.name ? 'Pet name is required' : '';
  const ageError = !isAgeOk(form.age) ? 'Enter age 0–40 (years)' : '';

  return (
    <div className="section-enter">
      <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
        <h2 className="h4 mb-0">Pet Profile</h2>
        {status.type && (
          <div className="alert alert-dark-custom py-2 px-3 mb-0">{status.msg}</div>
        )}
      </div>

      <form className="card card-body card-hover" onSubmit={onSubmit} noValidate>
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="avatar">{avatarEmoji}</div>
          <div className="small hint">
            Tip: Use a friendly name. Press <span className="kbd">Ctrl/⌘+S</span> to save.
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="opName">Pet Name *</label>
            <input
              id="opName"
              className={`form-control ${fieldClass('name', nameError)}`}
              placeholder="e.g. Bruno"
              value={form.name}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {touched.name && nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>

          <div className="col-md-6">
            <label htmlFor="opSpecies">Species</label>
            <select
              id="opSpecies"
              className="form-select"
              value={form.species}
              onChange={(e) => setForm({ ...form, species: e.target.value })}
            >
              <option value="Dog">Dog 🐶</option>
              <option value="Cat">Cat 🐱</option>
              <option value="Rabbit">Rabbit 🐰</option>
            </select>
          </div>

          <div className="col-md-6">
            <label htmlFor="opBreed">Breed</label>
            <input
              id="opBreed"
              className="form-control"
              placeholder="e.g. German Shepherd"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="opAge">Age</label>
            <input
              id="opAge"
              type="number"
              className={`form-control ${fieldClass('age', ageError)}`}
              value={form.age}
              onBlur={() => setTouched((t) => ({ ...t, age: true }))}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
            {touched.age && ageError && <div className="invalid-feedback">{ageError}</div>}
          </div>

          <div className="col-md-3">
            <label htmlFor="opVaccines">Vaccination</label>
            <select
              id="opVaccines"
              className="form-select"
              value={form.vaccines}
              onChange={(e) => setForm({ ...form, vaccines: e.target.value })}
            >
              <option value="Yes">Yes</option>
              <option value="Partial">Partial</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <div className="mt-3 d-flex gap-2 flex-wrap">
          <button
            className="btn btn-primary"
            disabled={!form.name || hasErrors()}
            type="submit"
          >
            Save
          </button>
          <button className="btn btn-outline-secondary" type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </form>

      {/* Yaha neeche saved profiles list */}
      {savedProfiles.length > 0 && (
        <div className="mt-4">
          <h4>Saved Profiles</h4>
          <ul className="list-group">
            {savedProfiles.map((p, idx) => (
              <li key={idx} className="list-group-item">
                <strong>{p.name}</strong> ({p.species}) - {p.age || 'N/A'} yrs | Vaccines: {p.vaccines}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
