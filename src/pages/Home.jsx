import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { AppCtx } from "../App.jsx";
import Welcome from "./Welcome.jsx";

const LS_KEYS = {
  name: "fec_username",
  type: "fec_userType",
  visitors: "fec_visitors",
};
const SS_KEYS = { seen: "fec_seen" };

const AVATAR_IMG = "https://cdn-icons-png.flaticon.com/512/616/616408.png";

const safeStorage = {
  readLS: (k, fallback = "") => {
    try {
      const v = localStorage.getItem(k);
      return v ? v.replace(/["\\]/g, "") : fallback;
    } catch {
      return fallback;
    }
  },
  writeLS: (k, v) => {
    try {
      localStorage.setItem(k, String(v).replace(/["\\]/g, ""));
    } catch {}
  },
  readSS: (k) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  writeSS: (k, v) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  },
};

export default function Home() {
  const { userType, setUserType, username, setUsername } =
    React.useContext(AppCtx);
  const [visitors, setVisitors] = React.useState(0);

  React.useEffect(() => {
    const savedName = safeStorage.readLS(LS_KEYS.name, "");
    const savedType = safeStorage.readLS(LS_KEYS.type, "");
    if (savedName) setUsername(savedName);
    setUserType(savedType || "owner");
  }, [setUserType, setUsername]);

  React.useEffect(() => {
    safeStorage.writeLS(LS_KEYS.name, (username ?? "").trim());
  }, [username]);

  React.useEffect(() => {
    if (userType) safeStorage.writeLS(LS_KEYS.type, userType);
  }, [userType]);

  React.useEffect(() => {
    const seen = safeStorage.readSS(SS_KEYS.seen);
    let n = parseInt(safeStorage.readLS(LS_KEYS.visitors, "0"), 10) || 0;
    if (!seen) {
      n += 1;
      safeStorage.writeLS(LS_KEYS.visitors, n);
      safeStorage.writeSS(SS_KEYS.seen, "1");
    }
    setVisitors(n);
  }, []);

  const roles = [
    {
      key: "owner",
      title: "Pet Owner",
      desc: "Track profiles, feeding plans, and reminders.",
      color: "linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)",
      to: "/owner/profile",
      icon: "🐾",
      cta: "Start as Owner",
    },
    {
      key: "vet",
      title: "Veterinarian",
      desc: "Manage appointments and care recommendations.",
      color: "linear-gradient(135deg, #FDE68A 0%, #F97316 100%)",
      to: "/vet/register",
      icon: "🩺",
      cta: "Start as Vet",
    },
    {
      key: "shelter",
      title: "Animal Shelter",
      desc: "Handle adoptions, listings, and outreach.",
      color: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 100%)",
      to: "/shelter/adoptions",
      icon: "🏠",
      cta: "Start as Shelter",
    },
  ];

  const setRole = (key) => {
    safeStorage.writeLS(LS_KEYS.type, key);
    setUserType(key);
  };

  const showOptions = String((username ?? "").trim()) !== "" && userType;

  return (
    <section>
      <style>{`
        .hero-wrap { 
          background:
            radial-gradient(1200px 600px at 10% 10%, rgba(59,130,246,.25), transparent 60%),
            radial-gradient(1000px 700px at 90% 0%, rgba(16,185,129,.2), transparent 60%),
            linear-gradient(180deg, #0ea5e9 0%, #0ea5e9 40%, #f8fafc 40%); 
        }
        .glass { backdrop-filter: blur(8px); background: rgba(255,255,255,0.7); }
        .tile { transition: transform .15s ease, box-shadow .15s ease; border: 0; }
        .tile:hover { transform: translateY(-3px); box-shadow: 0 .8rem 1.2rem rgba(0,0,0,.08); }
        .avatar { width: 40px; height: 40px; border-radius: 999px; display: grid; place-items: center; background:#fff; overflow: hidden; }
        .avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 999px; }
        .chip { 
          border: 1px solid rgba(0,0,0,.08); 
          background-color: #fff; 
          font-weight: normal; 
        }
        .chip.selected { 
          background-color: #000 !important; 
          color: #fff !important; 
          font-weight: bold; 
          border-color: #000; 
        }
        .chip.selected:hover { 
          background-color: #333 !important; 
        }
        .text-shadow { text-shadow: 0 1px 1px rgba(0,0,0,.2); }
        .quick-scroller { display: flex; overflow-x: auto; gap: .5rem; scrollbar-width: thin; -webkit-overflow-scrolling: touch; }
        .quick-scroller > a { flex: 0 0 auto; }
        @media (max-width: 576px) {
          .hero-wrap { padding: 1.25rem !important; }
          .hero-wrap h1.h2 { font-size: 1.25rem; }
          .hero-wrap .opacity-75 { font-size: .9rem; }
          .card .card-body { padding: 0.9rem; }
          .avatar { width: 36px; height: 36px; }
          .btn.btn-sm { padding: .35rem .6rem; font-size: .8rem; }
          .role-grid { row-gap: .75rem; }
        }
        @keyframes fecFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fecPop {
          0% { transform: scale(.92); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); }
        }
        .fec-backdrop {
          position: fixed;
          inset: 0;
          background: radial-gradient(60% 60% at 50% 40%, rgba(14,165,233,0.25), rgba(2,6,23,0.6)),
                      rgba(2,6,23,0.55);
          display: grid;
          place-items: center;
          z-index: 1000;
          animation: fecFadeIn .25s ease-out both;
          backdrop-filter: blur(3px);
        }
        .fec-card {
          width: min(92vw, 420px);
          border-radius: 20px;
          position: relative;
          padding: 1.8rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.9));
          box-shadow:
            0 20px 35px rgba(14, 165, 233, 0.20),
            0 6px 14px rgba(0, 0, 0, 0.10);
          backdrop-filter: blur(10px);
          animation: fecPop .3s cubic-bezier(.2,.8,.2,1) both;
          border: 1px solid rgba(14,165,233,0.20);
        }
      `}</style>

      <div className="hero-wrap rounded-4 p-4 p-md-5 mb-4 text-white">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="avatar text-dark border">
              <img src={AVATAR_IMG} alt="Pet logo" />
            </div>
            <div>
              <h1 className="h2 m-0">FurEver Care</h1>
              <div className="opacity-75">
                Your all-in-one pet wellbeing hub
              </div>
            </div>
          </div>

          <div
            className="d-flex align-items-center gap-2 glass rounded-3 px-3 py-2 text-dark"
            aria-label="Visitor counter"
          >
            <span className="small">Visitors</span>
            <span className="badge bg-primary" aria-live="polite">
              {visitors}
            </span>
          </div>
        </div>

        <div className="row g-3 mt-3 role-grid">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="glass rounded-4 p-3">
              <label className="small text-muted mb-1" htmlFor="nameInput">
                Your Name
              </label>
              <input
                id="nameInput"
                className="form-control form-control-sm"
                placeholder="Type your name"
                value={username ?? ""}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-7">
            <div className="glass rounded-4 p-3">
              <div className="small text-muted mb-1">Choose Role</div>
              <div className="d-flex gap-2 flex-wrap">
                {roles.map((r) => (
                  <button
                    key={r.key}
                    className={`btn btn-sm chip ${
                      userType === r.key ? "selected" : ""
                    }`}
                    onClick={() => setRole(r.key)}
                    type="button"
                  >
                    {r.icon} {r.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOptions && (
        <>
          <div className="row g-3">
            {roles.map((r) => (
              <div key={r.key} className="col-12 col-md-4">
                <div
                  className="card tile h-100 text-dark"
                  style={{ background: r.color }}
                >
                  <div className="card-body d-flex flex-column text-shadow">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span style={{ fontSize: 28 }}>{r.icon}</span>
                      {userType === r.key && (
                        <span className="badge bg-dark">Selected</span>
                      )}
                    </div>
                    <h3 className="h5 mb-1">{r.title}</h3>
                    <p className="small opacity-75 mb-3">{r.desc}</p>
                    <div className="mt-auto d-flex gap-2 flex-wrap">
                      <Link className="btn btn-outline-dark" to={r.to}>
                        {userType === r.key ? r.cta : `Explore ${r.title}`}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mt-4">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div className="quick-scroller">
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    to="/health"
                  >
                    💡 Health Tips
                  </Link>
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    to="/feeding"
                  >
                    🍽️ Feeding Guide
                  </Link>
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    to="/grooming"
                  >
                    🧴 Grooming Videos
                  </Link>
                  <Link
                    className="btn btn-sm btn-outline-secondary"
                    to="/products"
                  >
                    🛒 Product Showcase
                  </Link>
                </div>
                <Link
                  className="btn btn-sm btn-primary mt-2 mt-sm-0"
                  to={
                    userType === "owner"
                      ? "/owner/profile"
                      : userType === "vet"
                      ? "/vet/register"
                      : "/shelter/adoptions"
                  }
                >
                  Continue as {username || userType}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      <Welcome />
    </section>
  );
}
