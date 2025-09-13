import React from "react";
import { AppCtx } from "../../App.jsx";
import { fmtPrice } from "../../utils.js";


export default function Cart({ taxRate = 0.0, onApplyCoupon }) {
  const ctx = React.useContext(AppCtx) || {};
  const { cart = [], clearCart, removeFromCart, addToCart, setItemQty } = ctx;

  // Normalize items (qty defaults to 1)
  const items = Array.isArray(cart)
    ? cart.map((i) => ({
        ...i,
        qty: Number.isFinite(Number(i?.qty)) && Number(i.qty) > 0 ? Number(i.qty) : 1,
        price: Number.isFinite(Number(i?.price)) ? Number(i.price) : 0,
      }))
    : [];

  // Totals
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = Math.max(0, subtotal * Number(taxRate || 0));

  // Coupon state (optional)
  const [coupon, setCoupon] = React.useState("");
  const [applying, setApplying] = React.useState(false);
  const [couponInfo, setCouponInfo] = React.useState(null); // { label, amount?, percent?, applyTo? }
  const [status, setStatus] = React.useState("");

  const discount = React.useMemo(() => {
    if (!couponInfo) return 0;
    const base = couponInfo?.applyTo === "total" ? subtotal + tax : subtotal;
    const byAmount = Number.isFinite(Number(couponInfo?.amount)) ? Number(couponInfo.amount) : 0;
    const byPct = Number.isFinite(Number(couponInfo?.percent)) ? (base * Number(couponInfo.percent)) / 100 : 0;
    const d = Math.max(0, byAmount || byPct);
    return Math.min(base, d);
  }, [couponInfo, subtotal, tax]);

  const total = Math.max(0, subtotal + tax - discount);

  // Undo remove
  const [undo, setUndo] = React.useState(null); // {item, timer}

  const inc = (item) => {
    if (setItemQty) return setItemQty(item, item.qty + 1);
    if (addToCart) return addToCart({ ...item, qty: 1 });
  };
  const dec = (item) => {
    const newQty = item.qty - 1;
    if (setItemQty) return setItemQty(item, Math.max(0, newQty));
    if (newQty <= 0) return doRemove(item);
    // Fallback path without setItemQty: just remove one entry (best-effort)
    return doRemove(item);
  };

  const doRemove = (item) => {
    if (!removeFromCart) return;
    removeFromCart(item);
    const t = window.setTimeout(() => setUndo(null), 4000);
    setUndo({ item, t });
  };

  const doUndo = () => {
    if (!undo?.item) return;
    window.clearTimeout(undo.t);
    addToCart && addToCart(undo.item);
    setUndo(null);
  };

  const onQtyInput = (item, val) => {
    if (!setItemQty) return; // only enabled when we can set qty directly
    const n = Math.max(0, Math.min(999, Number.isFinite(Number(val)) ? Number(val) : 0));
    setItemQty(item, n);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!onApplyCoupon) return;
    const code = String(coupon || "").trim();
    if (!code) return;
    setApplying(true);
    setStatus("");
    try {
      const res = await onApplyCoupon(code, { items, subtotal, tax, total: subtotal + tax });
      if (typeof res === "number") {
        setCouponInfo({ label: code, amount: res, applyTo: "total" });
        setStatus("✅ Coupon applied");
      } else if (res && typeof res === "object") {
        const { amount, percent, applyTo, label } = res;
        if (Number.isFinite(Number(amount)) || Number.isFinite(Number(percent))) {
          setCouponInfo({ label: label || code, amount, percent, applyTo: applyTo || "total" });
          setStatus("✅ Coupon applied");
        } else {
          setCouponInfo(null);
          setStatus("⚠️ Coupon not valid");
        }
      } else if (typeof res === "string") {
        setCouponInfo(null);
        setStatus(res);
      } else {
        setCouponInfo(null);
        setStatus("⚠️ Coupon not valid");
      }
    } catch (err) {
      console.error(err);
      setCouponInfo(null);
      setStatus("⚠️ Could not apply coupon");
    } finally {
      setApplying(false);
    }
  };

  const clearCoupon = () => { setCouponInfo(null); setCoupon(""); };

  return (
    <div className="section-enter">
      <style>{`
        .card-hover { transition: transform .2s, box-shadow .2s; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.06); }
        .summary-sticky { position: sticky; top: 1rem; }
        .qty-input { width: 72px; }
        .item-img { width:56px; height:56px; object-fit: cover; }
        @media (max-width: 576px) {
          .item-img { width:44px; height:44px; }
        }
      `}</style>

      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="h4 m-0">Cart</h2>
        <div className="small text-muted" aria-live="polite">{status}</div>
      </div>

      {items.length === 0 ? (
        <div className="text-muted">
          Your cart is empty. <a href="/products" className="link-secondary">Browse products</a>
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card">
              <div className="list-group list-group-flush" role="list">
                {items.map((i, idx) => (
                  <div className="list-group-item d-flex justify-content-between align-items-center gap-3" key={idx} role="listitem">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      {i.image && (
                        <img src={i.image} alt={i.title} className="rounded item-img" loading="lazy"/>
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-medium text-truncate" title={i.title}>{i.title}</div>
                        {i.desc && (
                          <div className="text-muted small text-truncate" title={i.desc}>{i.desc}</div>
                        )}
                        {i.category && (
                          <span className="badge bg-light text-dark border mt-1">{i.category}</span>
                        )}
                        <div className="small text-muted mt-1">Unit: {fmtPrice(i.price)}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="btn-group" role="group" aria-label={`Change quantity for ${i.title}`}>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => dec(i)} type="button" aria-label={`Decrease ${i.title}`}>−</button>
                        {setItemQty ? (
                          <input
                            className="form-control form-control-sm qty-input text-center"
                            type="number"
                            min={0}
                            max={999}
                            value={i.qty}
                            onChange={(e) => onQtyInput(i, e.target.value)}
                            aria-label={`Quantity for ${i.title}`}
                          />
                        ) : (
                          <span className="btn btn-sm btn-light disabled" aria-live="polite">{i.qty}</span>
                        )}
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => inc(i)} type="button" aria-label={`Increase ${i.title}`}>+</button>
                      </div>

                      <div className="text-end" style={{ minWidth: 96 }}>
                        <div className="fw-semibold">{fmtPrice(i.price * i.qty)}</div>
                        {removeFromCart && (
                          <button className="btn btn-link text-danger p-0 small" onClick={() => doRemove(i)} type="button" aria-label={`Remove ${i.title}`}>Remove</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-body border-top d-flex justify-content-between align-items-center">
                <button className="btn btn-outline-secondary" onClick={clearCart} type="button">Clear Cart</button>
                <div className="text-muted small">{items.length} item(s)</div>
              </div>
            </div>

            {/* Undo toast */}
            {undo?.item && (
              <div className="alert alert-dark mt-2 py-2 d-flex justify-content-between align-items-center" role="status" aria-live="polite">
                <span>Removed <strong>{undo.item.title}</strong></span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light" onClick={doUndo}>Undo</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setUndo(null)}>Dismiss</button>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-4">
            <div className="card card-body summary-sticky card-hover">
              <h6 className="mb-3">Order Summary</h6>
              <div className="d-flex justify-content-between"><span>Subtotal</span><span>{fmtPrice(subtotal)}</span></div>
              <div className="d-flex justify-content-between"><span>Tax</span><span>{fmtPrice(tax)}</span></div>
              {couponInfo && (
                <div className="d-flex justify-content-between text-success">
                  <span>Discount{couponInfo?.label ? ` (${couponInfo.label})` : ''}</span>
                  <span>−{fmtPrice(discount)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>{fmtPrice(total)}</span></div>

              {onApplyCoupon && (
                <form className="mt-3" onSubmit={handleApplyCoupon}>
                  <div className="input-group input-group-sm">
                    <input name="coupon" className="form-control" placeholder="Promo code" value={coupon} onChange={(e) => setCoupon(e.target.value)} disabled={applying} />
                    {!couponInfo ? (
                      <button className="btn btn-secondary" type="submit" disabled={applying}>{applying ? 'Applying…' : 'Apply'}</button>
                    ) : (
                      <button className="btn btn-outline-secondary" type="button" onClick={clearCoupon}>Remove</button>
                    )}
                  </div>
                </form>
              )}

              <button className="btn btn-primary mt-3 w-100" type="button">Checkout</button>
              <div className="small text-muted mt-2">Prices include local currency formatting.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
