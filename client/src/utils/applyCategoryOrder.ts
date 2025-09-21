export function normalizeId(it: any) {
  return String(it?.id ?? it?._id ?? it?.slug ?? "");
}

export function applyCategoryOrder(items: any[], categoryId: string, orderMap?: Record<string, string[]>) {
  const order = orderMap?.[categoryId] ?? [];
  if (!Array.isArray(order) || order.length === 0) return items; // default = current order
  const pos = new Map(order.map((id, i) => [String(id), i]));
  return items
    .map((it, idx) => ({ it, idx, p: pos.has(normalizeId(it)) ? pos.get(normalizeId(it))! : Number.POSITIVE_INFINITY }))
    .sort((a, b) => a.p !== b.p ? a.p - b.p : a.idx - b.idx) // stable, unknowns keep old order after knowns
    .map(x => x.it);
}