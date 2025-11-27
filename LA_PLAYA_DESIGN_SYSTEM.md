# La Playa Restaurant - Front-End Design System

## Brand Identity Analysis

### Brand Essence
**La Playa** ("The Beach" in Spanish) evokes a premium Mediterranean beach club experience. The brand features marine life elements—whales, fish, and coastal birds—suggesting an ocean-focused, nature-inspired dining destination.

### Design Philosophy
- **Elegant Simplicity**: Clean, uncluttered layouts that let content breathe
- **Ocean Immersion**: Subtle marine textures and fluid animations
- **Premium Casual**: Upscale aesthetic with relaxed coastal warmth
- **Mobile-Native**: Designed for phone-first, one-hand navigation

---

## Color Palette

### Primary Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Deep Ocean** | `#1A3A4A` | 26, 58, 74 | Primary text, headers, navigation |
| **Aegean Blue** | `#2E7D8C` | 46, 125, 140 | Primary buttons, links, accents |
| **Seafoam** | `#5BA8A0` | 91, 168, 160 | Secondary accents, hover states |

### Neutral Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Warm Sand** | `#F5EDE4` | 245, 237, 228 | Page backgrounds |
| **Driftwood** | `#D4C8BC` | 212, 200, 188 | Cards, dividers |
| **Pearl White** | `#FDFBF9` | 253, 251, 249 | Card backgrounds, modals |
| **Coastal Stone** | `#8A8279` | 138, 130, 121 | Secondary text, captions |

### Accent Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sunset Coral** | `#E8856C` | 232, 133, 108 | CTAs, highlights, badges |
| **Golden Hour** | `#D4A574` | 212, 165, 116 | Price tags, featured items |
| **Seaweed Green** | `#4A7C6F` | 74, 124, 111 | Success states, availability |

### Semantic Colors

| State | Color | Hex |
|-------|-------|-----|
| Success | Seaweed Green | `#4A7C6F` |
| Warning | Golden Hour | `#D4A574` |
| Error | Sunset Coral | `#E8856C` |
| Info | Aegean Blue | `#2E7D8C` |

### CSS Variables

```css
:root {
  /* Primary */
  --color-deep-ocean: #1A3A4A;
  --color-aegean-blue: #2E7D8C;
  --color-seafoam: #5BA8A0;
  
  /* Neutrals */
  --color-warm-sand: #F5EDE4;
  --color-driftwood: #D4C8BC;
  --color-pearl-white: #FDFBF9;
  --color-coastal-stone: #8A8279;
  
  /* Accents */
  --color-sunset-coral: #E8856C;
  --color-golden-hour: #D4A574;
  --color-seaweed-green: #4A7C6F;
  
  /* Gradients */
  --gradient-ocean: linear-gradient(135deg, #1A3A4A 0%, #2E7D8C 100%);
  --gradient-sunset: linear-gradient(135deg, #E8856C 0%, #D4A574 100%);
  --gradient-sand: linear-gradient(180deg, #FDFBF9 0%, #F5EDE4 100%);
}
```

---

## Typography

### Font Stack

| Role | Font Family | Weights | Fallback |
|------|-------------|---------|----------|
| **Headlines** | Playfair Display | 400, 500, 600 | Georgia, serif |
| **Body Text** | DM Sans | 400, 500, 600 | -apple-system, sans-serif |
| **Accent/Logo** | Cormorant Garamond | 500, 600 | Georgia, serif |

### Type Scale (Mobile-First)

```css
/* Headings */
--text-display: clamp(2.5rem, 8vw, 4rem);      /* Hero titles */
--text-h1: clamp(1.75rem, 5vw, 2.5rem);        /* Page titles */
--text-h2: clamp(1.375rem, 4vw, 1.75rem);      /* Section headers */
--text-h3: clamp(1.125rem, 3vw, 1.375rem);     /* Card titles */
--text-h4: clamp(1rem, 2.5vw, 1.125rem);       /* Subheadings */

/* Body */
--text-body-lg: 1.125rem;    /* 18px - featured content */
--text-body: 1rem;           /* 16px - main body */
--text-body-sm: 0.875rem;    /* 14px - captions, metadata */
--text-caption: 0.75rem;     /* 12px - labels, badges */

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Typography Examples

```css
/* Hero Title */
.hero-title {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: var(--text-display);
  font-weight: 500;
  line-height: var(--leading-tight);
  color: var(--color-deep-ocean);
  letter-spacing: -0.02em;
}

/* Menu Item Name */
.item-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: var(--text-h3);
  font-weight: 600;
  line-height: var(--leading-tight);
  color: var(--color-deep-ocean);
}

/* Body Text */
.body-text {
  font-family: 'DM Sans', -apple-system, sans-serif;
  font-size: var(--text-body);
  font-weight: 400;
  line-height: var(--leading-relaxed);
  color: var(--color-coastal-stone);
}

/* Price */
.price {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-body-lg);
  font-weight: 600;
  color: var(--color-golden-hour);
}
```

---

## Mobile Layout System

### Screen Breakpoints

```css
--breakpoint-sm: 375px;   /* Small phones */
--breakpoint-md: 428px;   /* Large phones */
--breakpoint-lg: 768px;   /* Tablets */
--breakpoint-xl: 1024px;  /* Desktop */
```

### Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Safe Areas

```css
/* For notched devices */
--safe-top: env(safe-area-inset-top);
--safe-bottom: env(safe-area-inset-bottom);
--safe-left: env(safe-area-inset-left);
--safe-right: env(safe-area-inset-right);
```

---

## Page Layouts

### 1. Home/Menu Page (Mobile)

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │      HERO IMAGE/VIDEO       │    │  <- Full-width hero
│  │      with wave overlay      │    │     40vh height
│  │                             │    │
│  │  ┌───────────────────────┐  │    │
│  │  │   LA PLAYA             │  │    │  <- Centered logo
│  │  │   ──────────────       │  │    │
│  │  │   BEACH CLUB           │  │    │
│  │  └───────────────────────┘  │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ 🐚 Starters  🐟 Mains  🍰  │    │  <- Horizontal scroll
│  │    Seafood   Grill  Dessert │    │     category chips
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ┌─────────┐ ┌─────────┐     │    │  <- Menu grid
│  │ │  IMAGE  │ │  IMAGE  │     │    │     2 columns
│  │ │         │ │         │     │    │
│  │ ├─────────┤ ├─────────┤     │    │
│  │ │ Name    │ │ Name    │     │    │
│  │ │ $24     │ │ $18     │     │    │
│  │ └─────────┘ └─────────┘     │    │
│  │                             │    │
│  │ ┌─────────┐ ┌─────────┐     │    │
│  │ │  IMAGE  │ │  IMAGE  │     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🏠    📋    📞    👤       │    │  <- Floating bottom nav
│  │  Home  Menu  Call  Account  │    │     Fixed, blur bg
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 2. Menu Item Card (Mobile)

```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │         FOOD IMAGE          │    │  <- 4:3 aspect ratio
│  │      (lazy load + blur)     │    │     Rounded corners 16px
│  │                             │    │
│  │                     ┌─────┐ │    │
│  │                     │ 🐟  │ │    │  <- Marine icon badge
│  │                     └─────┘ │    │     (seafood indicator)
│  └─────────────────────────────┘    │
│                                     │
│  Grilled Sea Bass                   │  <- Item name (Cormorant)
│  ───────────────────                │
│  Mediterranean herbs, lemon,        │  <- Description (DM Sans)
│  olive oil, capers                  │     2 lines max, fade
│                                     │
│  ┌─────┐  ┌─────┐                   │
│  │ 🌿  │  │ 🍋  │                   │  <- Allergen/tag badges
│  │Vegan│  │Citrus│                  │
│  └─────┘  └─────┘                   │
│                                     │
│  $38                                │  <- Price (Golden Hour)
│                                     │
└─────────────────────────────────────┘
```

### 3. Item Detail Modal (Mobile)

```
┌─────────────────────────────────────┐
│                              ╳      │  <- Close button (top right)
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  │                             │    │
│  │       LARGE FOOD IMAGE      │    │  <- Full-width image
│  │       (high resolution)     │    │     16:10 aspect ratio
│  │                             │    │
│  │                             │    │
│  │   ← ●●○○○ →                 │    │  <- Image carousel dots
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Grilled Sea Bass            │    │  <- Large title
│  │                             │    │
│  │ Fresh Mediterranean sea bass│    │  <- Full description
│  │ grilled to perfection with  │    │     (no truncation)
│  │ aromatic herbs, served with │    │
│  │ lemon-caper butter sauce... │    │
│  │                             │    │
│  │ ┌─────────────────────────┐ │    │
│  │ │ Contains: Gluten, Fish  │ │    │  <- Allergen warning box
│  │ └─────────────────────────┘ │    │
│  │                             │    │
│  │ ─────────────────────────── │    │
│  │                             │    │
│  │         $38.00              │    │  <- Large price
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      📞 Call to Order       │    │  <- CTA button (Coral)
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 4. Category Navigation (Horizontal Scroll)

```
┌───────────────────────────────────────────────────────────────────┐
│                                                                   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────  │
│   │   🐚     │  │   🐟     │  │   🦐     │  │   🥗     │  │  🍰  │
│   │ Starters │  │ Seafood  │  │  Mains   │  │ Salads   │  │ Des  │
│   │          │  │ ════════ │  │          │  │          │  │      │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  └────  │
│                  ▲ Active                                         │
│                  (Aegean Blue underline)                          │
└───────────────────────────────────────────────────────────────────┘

Active state: Aegean Blue text + underline
Inactive: Coastal Stone text
Hover: Seafoam text
```

---

## Component Specifications

### 1. Hero Section

```css
.hero {
  height: 45vh;
  min-height: 320px;
  max-height: 500px;
  position: relative;
  overflow: hidden;
  background: var(--gradient-ocean);
}

.hero-media {
  position: absolute;
  inset: 0;
  object-fit: cover;
  opacity: 0.85;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    to top,
    var(--color-warm-sand) 0%,
    transparent 100%
  );
}

/* Animated wave SVG at bottom */
.hero-wave {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 200%;
  animation: wave 8s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
}
```

### 2. Menu Item Card

```css
.menu-card {
  background: var(--color-pearl-white);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 
    0 2px 8px rgba(26, 58, 74, 0.06),
    0 8px 24px rgba(26, 58, 74, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.menu-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(26, 58, 74, 0.12);
}

.menu-card-image {
  aspect-ratio: 4/3;
  width: 100%;
  object-fit: cover;
}

.menu-card-content {
  padding: var(--space-4);
}

.menu-card-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-deep-ocean);
  margin-bottom: var(--space-2);
}

.menu-card-description {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-body-sm);
  color: var(--color-coastal-stone);
  line-height: var(--leading-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.menu-card-price {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: var(--text-body-lg);
  color: var(--color-golden-hour);
  margin-top: var(--space-3);
}
```

### 3. Category Chip

```css
.category-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  white-space: nowrap;
}

.category-chip-icon {
  font-size: 24px;
  transition: transform 0.2s ease;
}

.category-chip-label {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-body-sm);
  font-weight: 500;
  color: var(--color-coastal-stone);
  transition: color 0.2s ease;
}

.category-chip.active .category-chip-label {
  color: var(--color-aegean-blue);
}

.category-chip.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: var(--color-aegean-blue);
  border-radius: 2px;
}

.category-chip:active .category-chip-icon {
  transform: scale(1.1);
}
```

### 4. Floating Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-3) var(--space-4);
  padding-bottom: calc(var(--space-3) + var(--safe-bottom));
  background: rgba(253, 251, 249, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(212, 200, 188, 0.5);
  display: flex;
  justify-content: space-around;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.nav-item-icon {
  width: 24px;
  height: 24px;
  color: var(--color-coastal-stone);
  transition: color 0.2s ease;
}

.nav-item.active .nav-item-icon {
  color: var(--color-aegean-blue);
}

.nav-item-label {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-caption);
  font-weight: 500;
  color: var(--color-coastal-stone);
}

.nav-item.active .nav-item-label {
  color: var(--color-aegean-blue);
}

.nav-item:active {
  transform: scale(0.95);
}
```

### 5. Modal / Dialog

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 58, 74, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 90vh;
  background: var(--color-pearl-white);
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  z-index: 201;
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-handle {
  width: 40px;
  height: 4px;
  background: var(--color-driftwood);
  border-radius: 2px;
  margin: var(--space-3) auto;
}

.modal-close {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}
```

### 6. Primary Button (CTA)

```css
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4) var(--space-6);
  background: var(--gradient-sunset);
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: var(--text-body);
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 12px rgba(232, 133, 108, 0.3);
}

.btn-primary:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(232, 133, 108, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--color-aegean-blue);
  border: 2px solid var(--color-aegean-blue);
  box-shadow: none;
}
```

---

## Animations & Micro-interactions

### 1. Page Transitions

```css
/* Fade + slide for page changes */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 0.2s ease;
}
```

### 2. Image Loading

```css
.lazy-image-placeholder {
  background: linear-gradient(
    110deg,
    var(--color-driftwood) 8%,
    var(--color-warm-sand) 18%,
    var(--color-driftwood) 33%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.lazy-image-loaded {
  animation: fadeIn 0.4s ease;
}
```

### 3. Card Hover/Tap States

```css
/* Desktop hover */
@media (hover: hover) {
  .menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 
      0 8px 24px rgba(26, 58, 74, 0.12),
      0 16px 48px rgba(26, 58, 74, 0.08);
  }
}

/* Mobile tap */
.menu-card:active {
  transform: scale(0.98);
}
```

### 4. Category Switch

```css
/* Slide indicator under active category */
.category-indicator {
  position: absolute;
  bottom: 0;
  height: 3px;
  background: var(--color-aegean-blue);
  border-radius: 2px;
  transition: left 0.3s ease, width 0.3s ease;
}
```

### 5. Pull-to-Refresh

```css
.pull-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  opacity: 0;
  transform: translateY(-100%);
  transition: opacity 0.2s, transform 0.2s;
}

.pull-indicator.visible {
  opacity: 1;
  transform: translateY(0);
}

.pull-indicator-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## Iconography

### Style Guidelines
- **Line weight**: 1.5px stroke
- **Corner radius**: Rounded caps
- **Style**: Organic, slightly rounded (ocean-inspired)
- **Library**: Lucide React or Phosphor Icons

### Recommended Icons

| Use Case | Icon Name | Description |
|----------|-----------|-------------|
| Home | `Home` | Simple house outline |
| Menu | `Utensils` | Fork and knife |
| Call | `Phone` | Telephone |
| Account | `User` | Person silhouette |
| Search | `Search` | Magnifying glass |
| Close | `X` | Simple X |
| Back | `ChevronLeft` | Left chevron |
| Share | `Share2` | Branch share icon |
| Heart | `Heart` | For favorites |
| Fish | `Fish` | Seafood indicator |
| Leaf | `Leaf` | Vegetarian/Vegan |
| Flame | `Flame` | Spicy indicator |
| Info | `Info` | Information |
| Warning | `AlertTriangle` | Allergen warning |

### Marine-Themed Custom Icons

Consider creating or sourcing custom icons for:
- **Whale** (brand mascot)
- **Shell** (starters/appetizers)
- **Fish** (seafood dishes)
- **Waves** (decorative element)
- **Anchor** (location/navigation)
- **Compass** (explore/discover)
- **Coral** (premium/special items)

---

## Illustration Style

### Brand Elements from Assets

Based on the provided design assets:

1. **Whale + Fish Motif**
   - Use as subtle watermarks on empty states
   - Background pattern at 5% opacity on hero sections
   - Loading state animations (whale swimming)

2. **Bird Patterns**
   - Header/footer decorative elements
   - Transition between sections
   - Animated flying birds on scroll

3. **Cushion Vectors**
   - Pattern inspiration for card backgrounds
   - Subtle texture overlays
   - Divider decorations

### Application

```css
/* Subtle whale watermark */
.empty-state::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 150px;
  background: url('/assets/whale-pattern.svg') no-repeat center;
  opacity: 0.04;
  pointer-events: none;
}

/* Animated birds on scroll */
.section-divider {
  position: relative;
  height: 60px;
  background: linear-gradient(
    to right,
    transparent,
    var(--color-driftwood) 20%,
    var(--color-driftwood) 80%,
    transparent
  );
}

.section-divider .bird {
  animation: fly 12s linear infinite;
}

@keyframes fly {
  0% { transform: translateX(-100%) translateY(0); }
  25% { transform: translateX(0%) translateY(-10px); }
  50% { transform: translateX(50%) translateY(0); }
  75% { transform: translateX(75%) translateY(-5px); }
  100% { transform: translateX(150%) translateY(0); }
}
```

---

## Responsive Considerations

### Mobile (375px - 767px)
- 2-column menu grid
- Full-width hero
- Bottom sheet modals
- Large touch targets (min 44px)
- Floating bottom navigation

### Tablet (768px - 1023px)
- 3-column menu grid
- Side-by-side hero (image + content)
- Centered modals
- Sidebar navigation option

### Desktop (1024px+)
- 4-column menu grid with hover states
- Full-width immersive hero
- Centered modal with backdrop
- Top navigation bar
- Larger typography scale

---

## Performance Guidelines

### Image Optimization
- **Thumbnails**: 400x300px, WebP, 80% quality
- **Modal images**: 800x600px, WebP, 85% quality
- **Hero**: 1200x800px, WebP with JPEG fallback
- **Lazy loading**: 100px root margin
- **Blur placeholder**: 20x15px base64 inline

### Animation Performance
- Use `transform` and `opacity` only
- Prefer CSS animations over JS
- Use `will-change` sparingly
- Reduce motion for `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Color Contrast
- All text meets WCAG AA (4.5:1 minimum)
- Deep Ocean on Pearl White: 10.5:1 ✓
- Coastal Stone on Pearl White: 4.8:1 ✓
- Golden Hour on Pearl White: 3.2:1 (large text only)

### Touch Targets
- Minimum 44x44px for all interactive elements
- 8px minimum spacing between targets

### Focus States
```css
:focus-visible {
  outline: 3px solid var(--color-aegean-blue);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for icons and buttons
- Skip navigation links
- Image alt text for all menu items

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up CSS variables (colors, spacing, typography)
- [ ] Import fonts (Playfair Display, DM Sans, Cormorant Garamond)
- [ ] Create base component styles
- [ ] Implement lazy loading for images

### Phase 2: Core Components
- [ ] Build Hero section with wave animation
- [ ] Create Menu Card component
- [ ] Implement Category Navigation (horizontal scroll)
- [ ] Build Modal/Dialog component
- [ ] Create Bottom Navigation

### Phase 3: Polish
- [ ] Add page transitions
- [ ] Implement skeleton loaders
- [ ] Add micro-interactions (hover, tap, etc.)
- [ ] Integrate brand illustrations (whale, birds)

### Phase 4: Optimization
- [ ] Optimize images (WebP, sizing)
- [ ] Test accessibility (contrast, focus states)
- [ ] Verify performance (Core Web Vitals)
- [ ] Test on multiple devices

---

## Quick Reference: Tailwind Classes

```jsx
// Hero Section
<div className="relative h-[45vh] min-h-[320px] max-h-[500px] bg-gradient-to-br from-[#1A3A4A] to-[#2E7D8C] overflow-hidden">

// Menu Card
<div className="bg-[#FDFBF9] rounded-2xl shadow-[0_2px_8px_rgba(26,58,74,0.06),0_8px_24px_rgba(26,58,74,0.08)] overflow-hidden transition-transform active:scale-[0.98]">

// Category Chip (Active)
<button className="flex flex-col items-center gap-2 px-5 py-3 text-[#2E7D8C] relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[3px] after:bg-[#2E7D8C] after:rounded-sm">

// Primary Button
<button className="w-full py-4 px-6 bg-gradient-to-br from-[#E8856C] to-[#D4A574] text-white font-semibold rounded-xl shadow-[0_4px_12px_rgba(232,133,108,0.3)] active:scale-[0.98]">

// Bottom Navigation
<nav className="fixed bottom-0 inset-x-0 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white/92 backdrop-blur-xl border-t border-[#D4C8BC]/50 flex justify-around z-[100]">
```

---

*This design system provides the foundation for building a premium, mobile-first restaurant menu experience for La Playa Beach Club.*
