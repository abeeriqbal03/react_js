import React, { useState, useEffect, useMemo, useRef, useContext } from "react";
import { AppCtx } from "../../App.jsx";
import { fmtPrice } from "../../utils.js";

const PLACEHOLDER = "https://via.placeholder.com/800x500?text=No+Image";

function sanitizeRow(p, i) {
  const id = p?.id ?? `p-${i}`;
  const title = String(p?.title ?? "").trim();
  const desc = String(p?.desc ?? "").trim();
  const category = String(p?.category ?? "").trim() || "Other";
  const priceNum = Number(p?.price);
  const price = Number.isFinite(priceNum) ? priceNum : NaN;
  const image = p.image;
  const stockVal = p?.stock;
  const stock = Number.isFinite(Number(stockVal))
    ? Number(stockVal)
    : undefined;

  return { id, title, desc, category, price, image, stock };
}

function isRowValid(row) {
  // Drop rows that are clearly malformed/empty
  if (!row.title && !row.desc && !row.category && !Number.isFinite(row.price))
    return false;
  // Must have a title and a finite price to display
  if (!row.title || !Number.isFinite(row.price)) return false;
  return true;
}

export default function Products({ dataUrl = "/data/products.json" }) {
  const { addToCart } = useContext(AppCtx);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("az");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const searchRef = useRef(null);

    useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;

        const arr = Array.isArray(data) ? data : [];
        const cleaned = arr.map(sanitizeRow).filter(isRowValid);

        setProducts(cleaned);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load products.");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  
  useEffect(() => {
    setPage(1);
  }, [search, category, sort, pageSize]);

  
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchCategory = !category || p.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch = q
        ? [p.title, p.desc, p.category].some((text) =>
            text.toLowerCase().includes(q)
          )
        : true;
      return matchCategory && matchSearch;
    });

    switch (sort) {
      case "za":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "priceAsc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "az":
      default:
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  }, [products, category, search, sort]);

  
  const total = filteredProducts.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageItems = filteredProducts.slice(start, start + pageSize);

  
  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((p) =>
      map.set(p.category, (map.get(p.category) || 0) + 1)
    );
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const onAdd = (product) => {
    if (product.stock === 0) return;
    addToCart(product);
  };

  return (
    <div className="products-wrap">
      <style>{`
        .products-wrap {
          padding: 12px;
        }
        .toolbar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 12px;
        }
        .toolbar input[type="search"],
        .toolbar select {
          padding: 8px 10px;
          border: 1px solid #d0d7de;
          border-radius: 8px;
          outline: none;
        }
        .toolbar input[type="search"]:focus,
        .toolbar select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.15);
        }
        .chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .chip {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #fff;
          cursor: pointer;
          transition: all .2s ease;
          font-size: 14px;
        }
        .chip[aria-pressed="true"] {
          background: #2563eb;
          color: #fff;
          border-color: #2563eb;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
          transition: transform .15s ease, box-shadow .15s ease;
        }
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,.06);
        }
        .card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          background: #f3f4f6;
        }
        .card-body {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          line-height: 1.2;
        }
        .desc {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
          min-height: 36px;
        }
        .price {
          font-weight: 700;
          margin: 0;
        }
        .stock {
          font-size: 13px;
          color: #374151;
        }
        .stock--oos { color: #dc2626; font-weight: 600; }
        .btn {
          margin-top: auto;
          padding: 10px 12px;
          border: 1px solid #2563eb;
          background: #2563eb;
          color: #fff;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          transition: filter .15s ease;
        }
        .btn:disabled {
          background: #9ca3af;
          border-color: #9ca3af;
          cursor: not-allowed;
        }
        .btn:not(:disabled):hover { filter: brightness(0.95); }

        .pagination {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .pagination button {
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          background: #fff;
          border-radius: 8px;
          cursor: pointer;
        }
        .pagination button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .muted { color: #6b7280; }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          gap: 8px;
          flex-wrap: wrap;
        }
      `}</style>

      <div className="header">
        <h2 style={{ margin: 0 }}>Product Showcase</h2>
        <div className="toolbar">
          <input
            type="search"
            ref={searchRef}
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="az">A–Z</option>
            <option value="za">Z–A</option>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Items per page"
            title="Items per page"
          >
            <option value={6}>6 / page</option>
            <option value={9}>9 / page</option>
            <option value={12}>12 / page</option>
            <option value={18}>18 / page</option>
          </select>
        </div>
      </div>

      
      <div className="chips">
        <button
          className="chip"
          onClick={() => setCategory("")}
          aria-pressed={category === ""}
        >
          All ({products.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.name}
            className="chip"
            onClick={() => setCategory(c.name)}
            aria-pressed={category === c.name}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      
      {loading && <p className="muted">Loading products…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && filteredProducts.length === 0 && (
        <p>No products found. Try adjusting filters.</p>
      )}

            {!loading && !error && filteredProducts.length > 0 && (
        <>
          <div className="grid">
            {pageItems.map((p) => (
              <div className="card" key={p.id}>
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = p.image;
                  }}
                />
                <div className="card-body">
                  <h3 className="title">{p.title}</h3>
                  <p className="desc">{p.desc}</p>
                  <p className="price">PKR. {p.price}</p>
                  <p className={`stock ${p.stock === 0 ? "stock--oos" : ""}`}>
                    {p.stock === 0
                      ? "Out of stock"
                      : Number.isFinite(p.stock)
                      ? `${p.stock} in stock`
                      : "In stock"}
                  </p>
                  <button
                    className="btn"
                    onClick={() => onAdd(p)}
                    disabled={p.stock === 0}
                    aria-label={`Add ${p.title} to cart`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          
          {pageCount > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                aria-label="First page"
              >
                « First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ‹ Prev
              </button>
              <span className="muted">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={currentPage === pageCount}
                aria-label="Next page"
              >
                Next ›
              </button>
              <button
                onClick={() => setPage(pageCount)}
                disabled={currentPage === pageCount}
                aria-label="Last page"
              >
                Last »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
