// Helper function to sort items by displayOrder field
// items: original array for a category
export function sortByDisplayOrder<T extends { displayOrder?: number | null }>(items: T[]): T[] {
  return items
    .map((it, idx) => ({ 
      it, 
      idx, 
      ord: Number.isFinite(+(it.displayOrder ?? 0)) ? +(it.displayOrder ?? 0) : Number.POSITIVE_INFINITY 
    }))
    .sort((a, b) => (a.ord !== b.ord ? a.ord - b.ord : a.idx - b.idx))
    .map(x => x.it);
}