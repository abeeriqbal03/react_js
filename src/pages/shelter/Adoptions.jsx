import React, { useEffect } from "react";
// import { loadJSON } from './utils.js'; // Adjust path if needed
import adoptableData from "../../../public/data/adoptable.json";

export default function Adoptions() {
  const [list, setList] = React.useState([]);
  console.log(list);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [imgOk, setImgOk] = React.useState(true);

  const [typeFilter, setTypeFilter] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState("relevance");
  const [favs, setFavs] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fec_favs") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    // Combine all arrays (dogs, cats, birds, etc.) into one array
    const combined = Object.values(adoptableData).flat();
    setList(combined);
    setLoading(false);
  }, []);

  // const fetchPets = React.useCallback(() => {
  //   let mounted = true;
  //   setLoading(true);
  //   setError("");
  //   loadJSON("/data/adoptable.json")
  //     .then((res) => {
  //       if (!mounted) return;
  //       const arr = Array.isArray(res) ? res : [];
  //       setList(arr);
  //     })
  //     .catch(() => mounted && setError("Could not load adoptable pets."))
  //     .finally(() => mounted && setLoading(false));
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  // React.useEffect(() => {
  //   const cleanup = fetchPets();
  //   return cleanup;
  // }, [fetchPets]);

  React.useEffect(() => {
    try {
      localStorage.setItem("fec_favs", JSON.stringify(favs));
    } catch {}
  }, [favs]);

  const types = React.useMemo(
    () =>
      Array.from(new Set(list.map((x) => x?.type).filter(Boolean))).sort(
        (a, b) => String(a).localeCompare(String(b))
      ),
    [list]
  );

  const toggleFav = React.useCallback((id) => {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const matchesQuery = (p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.breed, p.location, p.type, p.desc].some((v) =>
      (v || "").toString().toLowerCase().includes(q)
    );
  };

  const ageToNumber = (ageStr) => {
    if (!ageStr) return Number.POSITIVE_INFINITY;
    const s = String(ageStr).toLowerCase();
    let months = 0;
    const re =
      /(\d+(\.\d+)?)\s*(years?|yrs?|y|months?|mos?|mo|m|weeks?|wks?|wk|w|days?|d)/g;
    let m;
    while ((m = re.exec(s)) !== null) {
      const val = parseFloat(m[1]);
      const unit = m[0];
      if (/years?|yrs?|y/.test(unit)) months += val * 12;
      else if (/months?|mos?|mo|m/.test(unit)) months += val;
      else if (/weeks?|wks?|wk|w/.test(unit)) months += val / 4.345;
      else if (/days?|d/.test(unit)) months += val / 30.44;
    }
    if (months === 0) {
      const num = parseFloat(s.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) months = num;
      else months = Number.POSITIVE_INFINITY;
    }
    return months;
  };

  const filtered = list.filter(
    (p) => (!typeFilter || p.type === typeFilter) && matchesQuery(p)
  );

  const scoreMap = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map();
    filtered.forEach((p) => {
      let score = 0;
      if (q) {
        const name = (p.name || "").toLowerCase();
        const breed = (p.breed || "").toLowerCase();
        const type = (p.type || "").toLowerCase();
        const loc = (p.location || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();

        if (name.includes(q)) score += 6;
        if (name.startsWith(q)) score += 2;

        if (loc.includes(q)) score += 4;
        if (breed.includes(q)) score += 3;
        if (type.includes(q)) score += 2;
        if (desc.includes(q)) score += 1;

        if (/pupp|kitt|young/.test(q)) score += 1 / (1 + ageToNumber(p.age));
      }
      if (favs.includes(p.id)) score += 1.5;
      const idBoost = typeof p.id === "number" ? (p.id % 7) * 0.01 : 0;
      map.set(p.id, score + idBoost);
    });
    return map;
  }, [filtered, query, favs]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "name")
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sortBy === "ageAsc")
      arr.sort((a, b) => ageToNumber(a.age) - ageToNumber(b.age));
    else if (sortBy === "ageDesc")
      arr.sort((a, b) => ageToNumber(b.age) - ageToNumber(a.age));
    else
      arr.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
    return arr;
  }, [filtered, sortBy, scoreMap]);

  const clearFilters = () => {
    setTypeFilter("");
    setQuery("");
    setSortBy("relevance");
  };

  return (
    <div className="section-enter">
      <style>{`
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
        .pet-img { width: 100%; height: 180px; object-fit: cover; }
        .img-fallback { width:100%; height:180px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; font-size:2rem; }
        .chip { border: 1px solid rgba(0,0,0,.1); padding: .25rem .5rem; border-radius: 999px; display:inline-flex; align-items:center; gap:.35rem; margin:.25rem; font-size:.85rem; }
        .empty { border: 1px dashed rgba(0,0,0,.15); border-radius: .75rem; padding: 1rem; text-align:center; color: var(--bs-secondary-color, #6c757d); }
        .controls { gap:.5rem; }
        .type-scroller { display:flex; gap:.25rem; flex-wrap: wrap; }
        @media (max-width: 576px) {
          .controls { flex-direction: column; align-items: stretch !important; }
          .type-scroller { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: thin; }
          .type-scroller .btn { flex: 0 0 auto; }
        }
        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(0,0,0,.12), rgba(0,0,0,.06)); background-size:200% 100%; animation: sk 1.2s infinite; border-radius:.5rem; }
        @keyframes sk { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        .grid-tight > [class*='col-'] { display:flex; }
        .grid-tight .card { width:100%; }
        @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap controls">
        <h2 className="h4 m-0">Adoptable Pets</h2>
        <div className="d-flex flex-wrap gap-2 align-items-center w-auto">
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text">🔎</span>
            <input
              className="form-control"
              placeholder="Search name, breed, location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search by name, breed, or location"
            />
          </div>

          <div
            className="btn-group type-scroller"
            role="group"
            aria-label="Type filters"
          >
            <button
              type="button"
              className={`btn btn-sm ${
                !typeFilter ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setTypeFilter("")}
            >
              All
            </button>
            {types.map((t) => (
              <button
                type="button"
                key={t}
                className={`btn btn-sm ${
                  typeFilter === t ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            className="form-select form-select-sm"
            style={{ width: 180 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort results"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="name">Sort: Name (A–Z)</option>
            <option value="ageAsc">Sort: Young → Old</option>
            <option value="ageDesc">Sort: Old → Young</option>
          </select>

          {(typeFilter || query || sortBy !== "relevance") && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}

          {error && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={fetchPets}
            >
              Retry
            </button>
          )}
        </div>
      </div>

      <div className="small text-muted mb-2" aria-live="polite">
        {loading
          ? "Loading pets…"
          : `Showing ${sorted.length} of ${list.length}`}
      </div>

      {loading ? (
        <div className="row g-3 grid-tight" aria-live="polite" aria-busy="true">
          {[...Array(6)].map((_, i) => (
            <div className="col-md-6 col-lg-4" key={i}>
              <div className="card h-100 card-hover p-3">
                <div className="skeleton mb-3" style={{ height: 180 }} />
                <div
                  className="skeleton"
                  style={{ height: 18, width: "70%" }}
                />
                <div
                  className="skeleton mt-2"
                  style={{ height: 14, width: "95%" }}
                />
                <div
                  className="skeleton mt-2"
                  style={{ height: 14, width: "60%" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      ) : sorted.length === 0 ? (
        <div className="empty">No pets match your filters.</div>
      ) : (
        <div className="row g-3 grid-tight">
          {sorted.map((p) => {
            const idKey = p.id ?? `${p.name}-${p.location}-${p.breed}`;
            return (
              <div className="col-md-6 col-lg-4" key={idKey}>
                <div className="card h-100 card-hover">
                  <img
                    loading="lazy"
                    src={p.image}
                    className="card-img-top pet-img"
                    alt={p.stage || "Pet image"}
                    onError={() => setImgOk(false)}
                  />

                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0 h6">
                        {p.stage || "Unnamed"}
                      </h5>
                      <span className="badge bg-light text-dark border">
                        {p.tag || "—"}
                      </span>
                    </div>
                    <div className="small text-muted mb-2">
                      {[p.breed, p.age].filter(Boolean).join(" • ") || "—"}
                    </div>
                    {p.notes && (
                      <p className="card-text small mb-2">{p.notes}</p>
                    )}

                    <div className="mb-2">
                      {p.gender && <span className="chip">⚧ {p.gender}</span>}
                      {p.size && <span className="chip">📏 {p.size}</span>}
                      {p.vaccinated && (
                        <span className="chip">💉 Vaccinated</span>
                      )}
                      {p.neutered && <span className="chip">✂️ Neutered</span>}
                    </div>

                    <div className="mt-auto d-flex justify-content-between align-items-center gap-2 flex-wrap">
                      <a
                        className="btn btn-sm btn-outline-secondary"
                        href="/shelter/adopt"
                      >
                        Apply to Adopt
                      </a>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          favs.includes(p.id)
                            ? "btn-warning"
                            : "btn-outline-warning"
                        }`}
                        onClick={() => toggleFav(p.id)}
                        aria-pressed={favs.includes(p.id)}
                        aria-label={`${
                          favs.includes(p.id) ? "Unsave" : "Save"
                        } ${p.name || "pet"}`}
                      >
                        {favs.includes(p.id) ? "★ Saved" : "☆ Save"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {sorted.length > 0 && (
        <div className="mt-3 small text-muted">
          Tip: Use the search box to quickly find a breed or city, or tap{" "}
          <span className="chip">☆ Save</span> to bookmark pets locally.
        </div>
      )}
    </div>
  );
}
