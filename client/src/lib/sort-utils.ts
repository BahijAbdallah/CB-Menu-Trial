export function sortByDisplayOrder(items: any[]): any[] {
  const ord = (it: any): number => {
    const v = it.displayOrder ?? it.display_order ?? it.order ?? null;
    if (v === null || v === undefined) return Number.POSITIVE_INFINITY;
    const n = parseInt(String(v).trim(), 10);
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };
  return items
    .map((it: any, idx: number) => ({ it, idx, o: ord(it) }))
    .sort((a: any, b: any) => (a.o !== b.o ? a.o - b.o : a.idx - b.idx)) // nulls last, stable
    .map((x: any) => x.it);
}