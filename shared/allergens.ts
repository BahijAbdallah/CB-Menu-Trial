export interface Allergen {
  slug: string;
  label: string;
  icon: string;
}

export const ALLERGENS: Allergen[] = [
  { slug: 'milk', label: 'Milk', icon: '/icons/allergens/milk.svg' },
  { slug: 'gluten', label: 'Gluten', icon: '/icons/allergens/gluten.svg' },
  { slug: 'fish', label: 'Fish', icon: '/icons/allergens/fish.svg' },
  { slug: 'soya', label: 'Soya', icon: '/icons/allergens/soya.svg' },
  { slug: 'nuts', label: 'Nuts', icon: '/icons/allergens/nuts.svg' },
];

export function getAllergenBySlug(slug: string): Allergen | undefined {
  return ALLERGENS.find(allergen => allergen.slug === slug);
}

export function parseAllergens(allergensJson: string | null): string[] {
  if (!allergensJson) return [];
  try {
    return JSON.parse(allergensJson);
  } catch {
    return [];
  }
}

export function serializeAllergens(allergens: string[]): string {
  return JSON.stringify(allergens);
}

export function getAllergensByItem(allergens: string[]): Allergen[] {
  return allergens
    .map(slug => getAllergenBySlug(slug))
    .filter((allergen): allergen is Allergen => allergen !== undefined);
}