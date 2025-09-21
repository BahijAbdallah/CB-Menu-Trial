// Helper function to sort items by displayOrder field  
const orderVal = (it: any) => {
  const v = it.displayOrder ?? it.display_order ?? it.order ?? null;
  const n = typeof v === 'string' ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

export const sortByDisplayOrder = (items: any[]) =>
  items
    .map((it, idx) => ({ it, idx, ord: orderVal(it) }))
    .sort((a, b) => (a.ord !== b.ord ? a.ord - b.ord : a.idx - b.idx))
    .map(x => x.it);