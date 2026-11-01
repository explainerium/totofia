/** Latin-only URL slug: "Organic Cotton Romper (Sage)" → "organic-cotton-romper-sage". */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const slugSchemaPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
