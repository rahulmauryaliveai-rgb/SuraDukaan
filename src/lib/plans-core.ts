/** Pure plan-limit logic (no database) — safe for client and tests. */

export function checkProductLimit(productCount: number, productLimit: number): boolean {
  if (productLimit < 0) return true;
  return productCount < productLimit;
}
