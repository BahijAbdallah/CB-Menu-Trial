export function normalizeId(x: any) { 
  return String(x?.id ?? x?._id ?? x?.slug ?? ""); 
}

export function applyCategoryOrder(
  items: any[],                // items of ONE category
  categoryId: string,          // that category's id/slug
  orderMap?: Record<string, string[]>
) {
  const order = orderMap?.[categoryId] ?? [];
  if (!Array.isArray(order) || order.length === 0) return items; // default: keep current order

  const pos = new Map(order.map((id, i) => [String(id), i]));

  // keep unknown items AFTER known ones; preserve their previous relative order (stable)
  return items
    .map((it, idx) => ({ it, idx, p: pos.has(normalizeId(it)) ? pos.get(normalizeId(it))! : Number.POSITIVE_INFINITY }))
    .sort((a, b) => (a.p !== b.p ? a.p - b.p : a.idx - b.idx))
    .map(x => x.it);
}