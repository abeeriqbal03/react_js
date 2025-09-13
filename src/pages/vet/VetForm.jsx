import React from "react";

const LS_KEY = "fec_vetForm";

const isPhoneLike = (v = "") => /[0-9+()\-\s]{7,}/.test(v.trim());
const isUrl = (v = "") => {
  if (!v) return true; // optional
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

export default function VetForm() {
  const [f, setF] = React.useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(LS_KEY)) || {
          name: "",
          specialization: "General",
          contact: "",
          image: "",
        }
      );
    } catch {
      return { name: "", specialization: "General", contact: "", image: "" };
    }
  });

  const [saved, setSaved] = React.useState(false);
  const [touched, setTouched] = React.useState({});

  const onField = (k) => (e) => {
    setF((s) => ({ ...s, [k]: e.target.value }));
  };

  const markTouched = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errors = {
    name: !f.name.trim() ? "Name is required" : "",
    contact:
      f.contact && !isPhoneLike(f.contact) ? "Looks like an invalid phone" : "",
    image: isUrl(f.image) ? "" : "Enter a valid URL",
  };

  const canSave = !errors.name && !errors.contact && !errors.image;

  const save = (e) => {
    e.preventDefault();
    if (!canSave) return;
    localStorage.setItem(LS_KEY, JSON.stringify(f));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const reset = () => {
    const empty = {
      name: "",
      specialization: "General",
      contact: "",
      image: "",
    };
    setF(empty);
    localStorage.setItem(LS_KEY, JSON.stringify(empty));
  };

  const showImage = Boolean(f.image && isUrl(f.image));

  return (
    <div className="section-enter">
      <style>{`
        .vf-card { position: relative; }
        .vf-help { font-size: .85rem; }
        .vf-img { width: 100%; max-width: 180px; height: 180px; object-fit: cover; border-radius: .75rem; border: 1px solid rgba(0,0,0,.08); }
        .vf-actions { gap: .5rem; flex-wrap: wrap; }
        @media (max-width: 576px) {
          .vf-img { max-width: 140px; height: 140px; }
          .vf-actions .btn { padding: .4rem .7rem; font-size: .9rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .alert { transition: none !important; }
        }
      `}</style>

      <h2 className="h4 mb-3">👩‍⚕️ Register Veterinarian</h2>

      {saved && (
        <div className="alert alert-success" role="alert" aria-live="polite">
          ✅ Information saved locally!
        </div>
      )}

      <form className="card card-body vf-card" onSubmit={save} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="vfName">
              Full Name
            </label>
            <input
              id="vfName"
              className={`form-control ${
                touched.name && errors.name ? "is-invalid" : ""
              }`}
              placeholder="Dr. Sarah Khan"
              value={f.name}
              onChange={onField("name")}
              onBlur={markTouched("name")}
              required
            />
            {touched.name && errors.name && (
              <div className="invalid-feedback">{errors.name}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="vfSpec">
              Specialization
            </label>
            <select
              id="vfSpec"
              className="form-select"
              value={f.specialization}
              onChange={onField("specialization")}
            >
              <option>General</option>
              <option>Small Animal Medicine</option>
              <option>Exotic Pets</option>
              <option>Avian Medicine</option>
              <option>Feline Specialist</option>
              <option>Canine Behavior</option>
              <option>Equine Medicine</option>
              <option>Reptile & Amphibian Care</option>
              <option>Nutrition & Diet</option>
              <option>Emergency & Critical Care</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="vfContact">
              Contact Number
            </label>
            <input
              id="vfContact"
              type="tel"
              inputMode="tel"
              className={`form-control ${
                touched.contact && errors.contact ? "is-invalid" : ""
              }`}
              placeholder="+92 300 1234567"
              value={f.contact}
              onChange={onField("contact")}
              onBlur={markTouched("contact")}
              required
              aria-describedby="vfContactHelp"
            />
            <small id="vfContactHelp" className="text-muted vf-help">
              We’ll only use this to contact you.
            </small>
            {touched.contact && errors.contact && (
              <div className="invalid-feedback">{errors.contact}</div>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="vfImage">
              Profile Image URL
            </label>
            <input
              id="vfImage"
              className={`form-control ${
                touched.image && errors.image ? "is-invalid" : ""
              }`}
              placeholder="https://example.com/photo.jpg"
              value={f.image}
              onChange={onField("image")}
              onBlur={markTouched("image")}
              aria-describedby="vfImgHelp"
            />
            <small id="vfImgHelp" className="text-muted vf-help">
              Optional
            </small>
            {touched.image && errors.image && (
              <div className="invalid-feedback">{errors.image}</div>
            )}

            {showImage && (
              <div className="mt-2">
                <img
                  className="vf-img"
                  src={f.image}
                  alt="Profile preview"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 d-flex vf-actions">
          <button type="submit" className="btn btn-primary" disabled={!canSave}>
            💾 Save
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={reset}
          >
            ♻️ Reset
          </button>
          <a className="btn btn-outline-secondary" href="/vet/dashboard">
            📊 Go to Dashboard
          </a>
        </div>
      </form>
    </div>
  );
}
