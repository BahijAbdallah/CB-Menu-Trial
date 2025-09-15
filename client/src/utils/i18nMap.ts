export type Localized = Partial<Record<"en"|"ar"|"fr", string>>;

export function normalizeLocale(lng: string): "en"|"ar"|"fr" {
  const L = (lng || "en").toLowerCase();
  if (L.startsWith("ar")) return "ar";
  if (L.startsWith("fr")) return "fr";
  return "en";
}

export function pick(loc: Localized | undefined, lng: string): string {
  const L = normalizeLocale(lng);
  if (!loc) return "";
  return loc[L] || loc.en || loc.ar || loc.fr || "";
}

export function dir(lng: string) {
  return normalizeLocale(lng) === "ar" ? "rtl" : "ltr";
}

export function align(lng: string) {
  return normalizeLocale(lng) === "ar" ? "right" : "left";
}