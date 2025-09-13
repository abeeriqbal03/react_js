import React, { useState, useEffect } from "react";

export default function Welcome() {
  const [show, setShow] = useState(false);

  
  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShow(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!show) return null;

  return (
    <>
      {}
      <style>{`
        @keyframes fecFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fecPop {
          0% { transform: scale(0.92); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); }
        }
        .fec-backdrop {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(60% 60% at 50% 40%, rgba(14,165,233,0.25), rgba(2,6,23,0.6)),
            rgba(2,6,23,0.55);
          display: grid;
          place-items: center;
          z-index: 1000;
          animation: fecFadeIn .25s ease-out both;
          backdrop-filter: blur(3px);
        }
        .fec-card {
          width: min(94vw, 460px);        
          border-radius: 22px;
          position: relative;
          padding: 2rem;                    
          background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.92));
          box-shadow:
            0 20px 35px rgba(14, 165, 233, 0.20),
            0 6px 14px rgba(0,0,0,0.10);
          border: 1px solid rgba(14,165,233,0.22);
          backdrop-filter: blur(10px);
          animation: fecPop .3s cubic-bezier(.2,.8,.2,1) both;
          text-align: center;
        }
        /* Title bigger + theme blue gradient */
        .fec-title {
          margin: 0 0 .85rem 0;
          font-weight: 800;
          font-size: 1.7rem;               
          background: linear-gradient(135deg, #0ea5e9, #3B82F6);
          -webkit-background-clip: text;
                  background-clip: text;
          color: transparent;
          letter-spacing: .2px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.4);
        }
        .fec-sub {
          margin: 0 0 1.6rem 0;
          color: #0b1324;
          opacity: .85;
          line-height: 1.55;
          font-size: 1.02rem;
        }
        /* Button pure theme blue (no green) */
        .fec-button {
          width: 100%;
          border: 0;
          cursor: pointer;
          padding: 0.95rem 1rem;
          border-radius: 14px;
          color: #fff;
          font-weight: 700;
          letter-spacing: .2px;
          background: linear-gradient(135deg, #0ea5e9, #3B82F6);
          box-shadow:
            0 10px 18px rgba(14,165,233,0.28),
            inset 0 0 0 1px rgba(255,255,255,0.25);
          transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
        }
        .fec-button:hover {
          transform: translateY(-1px);
          box-shadow:
            0 14px 24px rgba(59,130,246,0.35),
            inset 0 0 0 1px rgba(255,255,255,0.35);
          filter: saturate(1.06);
        }
        .fec-button:focus {
          outline: none;
          box-shadow:
            0 0 0 3px rgba(14,165,233,0.25),
            0 14px 24px rgba(59,130,246,0.35),
            inset 0 0 0 1px rgba(255,255,255,0.4);
        }
        .fec-close {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;                       
          height: 36px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          border: 1px solid rgba(14,165,233,0.25);
          background: rgba(255,255,255,0.78);
          cursor: pointer;
          transition: background .12s ease, transform .12s ease, opacity .12s ease;
        }
        .fec-close:hover { background: rgba(255,255,255,0.95); transform: rotate(6deg); }
        .fec-x {
          line-height: 0;
          font-size: 18px;
          color: #0b1324;
          opacity: .8;
        }
      `}</style>

      {}
      <div className="fec-backdrop" onClick={() => setShow(false)}>
        
        <div className="fec-card" onClick={(e) => e.stopPropagation()}>
          <button
            className="fec-close"
            aria-label="Close welcome"
            onClick={() => setShow(false)}
            type="button"
          >
            <span className="fec-x">×</span>
          </button>

          <h2 className="fec-title">Welcome to FurEver Care 🐾</h2>
          <p className="fec-sub">
            Your all-in-one pet wellbeing hub — track care, feeding, and more.
          </p>

          <button className="fec-button" onClick={() => setShow(false)}>
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
