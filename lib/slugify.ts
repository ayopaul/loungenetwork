// lib/slugify.ts
// Centralized slug generation utility

/**
 * Convert a string to a URL-friendly slug
 * @param text The text to slugify
 * @returns A lowercase, hyphenated slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")      // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "")   // Remove non-word characters except hyphens
    .replace(/--+/g, "-")      // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "")        // Remove leading hyphens
    .replace(/-+$/, "");       // Remove trailing hyphens
}

/**
 * Generate a unique slug with a timestamp suffix
 * Useful for schedule shows that need unique identifiers
 * @param text The text to slugify
 * @param suffix Optional suffix (e.g., time like "1200")
 * @returns A unique slug
 */
export function generateUniqueSlug(text: string, suffix?: string): string {
  const baseSlug = slugify(text);
  return suffix ? `${baseSlug}-${suffix}` : baseSlug;
}
