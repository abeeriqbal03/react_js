export async function loadJSON(p) {
  const r = await fetch(p);
  if (!r.ok) throw new Error("load " + p);
  return r.json();
}
export const fmtPrice = (n) => "PKR " + (Number(n) * 278).toFixed(0);
export const get = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
export const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
