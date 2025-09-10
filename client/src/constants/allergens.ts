export type AllergenSlug = 'milk'|'gluten'|'fish'|'soya'|'peanuts'|'nuts';

export const ALLERGENS: { slug: AllergenSlug; label: string; icon: string }[] = [
  { slug: 'milk',    label: 'Milk',    icon: '/icons/allergens/milk.png' },
  { slug: 'gluten',  label: 'Gluten',  icon: '/icons/allergens/gluten.png' },
  { slug: 'fish',    label: 'Fish',    icon: '/icons/allergens/fish.png' },
  { slug: 'soya',    label: 'Soya',    icon: '/icons/allergens/soya.png' },
  { slug: 'peanuts', label: 'Peanuts', icon: '/icons/allergens/peanuts.png' },
  { slug: 'nuts',    label: 'Nuts',    icon: '/icons/allergens/nuts.png' },
];

export const ALLERGENS_MAP = Object.fromEntries(
  ALLERGENS.map(a => [a.slug, a])
) as Record<AllergenSlug, {slug: AllergenSlug; label: string; icon: string}>;