export const defaultMenuImages = {
  breakfast: [
    "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
  ],
  mainCourse: [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
  ],
  desserts: [
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
  ],
  default: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
};

export function getDefaultImageForItem(categorySlug: string, itemIndex: number = 0): string {
  switch (categorySlug) {
    case 'breakfast':
      return defaultMenuImages.breakfast[itemIndex % defaultMenuImages.breakfast.length];
    case 'main-course':
      return defaultMenuImages.mainCourse[itemIndex % defaultMenuImages.mainCourse.length];
    case 'desserts':
      return defaultMenuImages.desserts[itemIndex % defaultMenuImages.desserts.length];
    default:
      return defaultMenuImages.default;
  }
}
