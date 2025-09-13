import React from "react";
import { loadJSON } from "../../utils.js";


 
export default function Grooming({ dataUrl = "/data/groomingVideos.json" }) {
  
  const [videos, setVideos] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [activeTag, setActiveTag] = React.useState("");
  const [sort, setSort] = React.useState("az"); // az | za | newest | oldest
  const [selected, setSelected] = React.useState(null); // selected video for modal

  const searchRef = React.useRef(null);

  const fetchVideos = React.useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loadJSON(dataUrl)
      .then((data) => {
        if (cancelled) return;
        
        const list = Array.isArray(data) ? data : [];
        const normalized = list.map((x, i) => ({
          id: x?.id ?? `v-${i}`,
          title: String(x?.title ?? "Untitled"),
          url: String(x?.url ?? ""),
          tags: Array.isArray(x?.tags)
            ? x.tags.filter(Boolean).map(String)
            : x?.tags
            ? String(x.tags)
                .split(/[,/]|\s#|#/)
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          date: x?.date ? new Date(x.date) : null,
        }));
        setVideos(normalized);
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setError("Failed to load grooming videos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  React.useEffect(() => {
    const cleanup = fetchVideos();
    return cleanup;
  }, [fetchVideos]);

  
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [q]);

  
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = searchRef.current;
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) {
        setQ("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  
  React.useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    if (selected) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [selected]);

  
  const tags = React.useMemo(() => {
    const map = new Map();
    for (const v of videos)
      for (const t of v.tags || []) map.set(t, (map.get(t) || 0) + 1);
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [videos]);

  
  const filtered = React.useMemo(() => {
    const qOk = (s) =>
      debouncedQ ? String(s).toLowerCase().includes(debouncedQ) : true;
    let arr = videos.filter((v) => {
      const hit =
        qOk(v.title) || qOk(v.url) || (v.tags || []).some((t) => qOk(t));
      const tagOk = !activeTag || (v.tags || []).includes(activeTag);
      return hit && tagOk;
    });
    switch (sort) {
      case "za":
        arr.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        arr.sort(
          (a, b) => (b.date?.getTime?.() || 0) - (a.date?.getTime?.() || 0)
        );
        break;
      case "oldest":
        arr.sort(
          (a, b) => (a.date?.getTime?.() || 0) - (b.date?.getTime?.() || 0)
        );
        break;
      case "az":
      default:
        arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    return arr;
  }, [videos, debouncedQ, activeTag, sort]);

 
  const getYouTubeId = (url = "") => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.replace(/\//g, "");
    } catch (_) {}
    return null;
  };
  const getEmbedUrl = (url = "") => {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : url;
  };
  const getThumb = (url) => {
    const id = getYouTubeId(url);
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
  };

 
  const Skeleton = () => (
    <div className="col-lg-6">
      <div className="card h-100 placeholder-glow">
        <div className="ratio ratio-16x9 bg-light rounded-top" />
        <div className="card-body">
          <div className="placeholder col-8 mb-2" />
          <div className="placeholder col-10" />
        </div>
      </div>
    </div>
  );

 
  const PlayerModal = () => (
    <div
      className={`modal fade ${selected ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      aria-modal={selected ? "true" : undefined}
      aria-hidden={!selected}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{selected?.title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {selected && (
              <div className="ratio ratio-16x9">
                <iframe
                  src={getEmbedUrl(selected.url)}
                  title={selected.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <a
              className="btn btn-outline-secondary"
              href={selected?.url}
              target="_blank"
              rel="noreferrer"
            >
              Open in YouTube
            </a>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
      {selected && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setSelected(null)}
        />
      )}
    </div>
  );

  return (
    <div className="section-enter">
      <style>{`
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,.08); }
        .thumb { width:100%; height:100%; object-fit: cover; }
        .play-btn { width:64px; height:64px; display:grid; place-items:center; }
        .chip-btn { border: 1px solid rgba(0,0,0,.12); background:#fff; padding: .25rem .6rem; border-radius: 999px; font-size:.85rem; }
        .chip-btn[aria-checked='true'] { background:#000; color:#fff; border-color:#000; font-weight:700; }
        .controls { gap:.5rem; flex-wrap: wrap; }
        .chip-bar { display:flex; gap:.4rem; flex-wrap: wrap; }
        @media (max-width: 576px) {
          .controls { align-items: stretch !important; }
          .chip-bar { overflow-x:auto; flex-wrap:nowrap; -webkit-overflow-scrolling:touch; scrollbar-width: thin; }
          .chip-bar > * { flex: 0 0 auto; }
        }
        @media (prefers-reduced-motion: reduce) { .card-hover { transition: none; } }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap controls">
        <h2 className="h4 m-0">Grooming Videos</h2>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="input-group input-group-sm" style={{ maxWidth: 280 }}>
            <span className="input-group-text" id="grooming-search">
              🔎
            </span>
            <input
              ref={searchRef}
              className="form-control form-control-sm"
              placeholder="Search videos… ( / )"
              aria-label="Search grooming videos"
              aria-describedby="grooming-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setQ("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <select
            className="form-select form-select-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort videos"
          >
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {(q || activeTag || sort !== "az") && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => {
                setQ("");
                setDebouncedQ("");
                setActiveTag("");
                setSort("az");
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      
      {tags.length > 0 && (
        <div
          className="mb-3 chip-bar"
          role="radiogroup"
          aria-label="Filter by tag"
        >
          <button
            type="button"
            className="chip-btn"
            aria-checked={activeTag === ""}
            role="radio"
            onClick={() => setActiveTag("")}
          >
            All ({videos.length})
          </button>
          {tags.map((t) => (
            <button
              key={t.name}
              type="button"
              className="chip-btn"
              aria-checked={activeTag === t.name}
              role="radio"
              onClick={() => setActiveTag(t.name)}
            >
              {t.name} ({t.count})
            </button>
          ))}
        </div>
      )}

      
      <div className="small text-muted mb-2" aria-live="polite">
        {loading ? (
          "Loading videos…"
        ) : error ? (
          <span className="text-danger d-inline-flex align-items-center gap-2">
            {error}
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={fetchVideos}
            >
              Retry
            </button>
          </span>
        ) : (
          <>
            Showing <strong>{filtered.length}</strong> video
            {filtered.length === 1 ? "" : "s"}
            {activeTag ? (
              <>
                {" "}
                in{" "}
                <span className="badge bg-light text-dark border">
                  {activeTag}
                </span>
              </>
            ) : null}
            {debouncedQ ? (
              <>
                {" "}
                for{" "}
                <span className="badge bg-light text-dark border">
                  {debouncedQ}
                </span>
              </>
            ) : null}
          </>
        )}
      </div>

      {loading && (
        <div className="row g-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-muted py-4">No videos match your filters.</div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="row g-3" role="list">
          {filtered.map((x) => {
            const thumb = getThumb(x.url);
            return (
              <div className="col-lg-6" key={x.id} role="listitem">
                <div className="card h-100 card-hover">
                  <div className="ratio ratio-16x9 position-relative bg-light">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={x.title}
                        className="thumb"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center w-100 h-100 text-muted">
                        <span className="small">Preview not available</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="btn btn-light position-absolute top-50 start-50 translate-middle rounded-circle shadow play-btn"
                      aria-label={`Play ${x.title}`}
                      onClick={() => setSelected(x)}
                    >
                      ▶
                    </button>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-2 text-truncate" title={x.title}>
                      {x.title}
                    </h6>
                    {x.tags?.length > 0 && (
                      <div className="d-flex gap-1 flex-wrap">
                        {x.tags.slice(0, 5).map((t, i) => (
                          <span
                            key={i}
                            className="badge bg-light text-dark border"
                          >
                            #{t}
                          </span>
                        ))}
                        {x.tags.length > 5 && (
                          <span className="badge bg-light text-dark border">
                            +{x.tags.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && <PlayerModal />}
    </div>
  );
}
