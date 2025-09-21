// Helper function to sort items for a category based on saved order settings
// items: original array for a category (keep as-is)
// categoryId: current category identifier
// settings: object that includes itemOrderByCategory map

export function sortItemsForCategory<T extends { id: number | string }>(
  items: T[], 
  categoryId: string | number, 
  settings: { itemOrderByCategory?: Record<string, string[]> } | undefined
): T[] {
  const order = settings?.itemOrderByCategory?.[categoryId.toString()] || [];
  const pos = new Map(order.map((id, i) => [id, i]));
  
  // preserve original order for items not in 'order'
  return items
    .map((it, idx) => ({ it, idx }))
    .sort((a, b) => {
      const ai = pos.has(a.it.id.toString()) ? pos.get(a.it.id.toString())! : Number.MAX_SAFE_INTEGER;
      const bi = pos.has(b.it.id.toString()) ? pos.get(b.it.id.toString())! : Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi;
      return a.idx - b.idx; // stable fallback
    })
    .map(x => x.it);
}