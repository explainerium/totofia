import type { AdminCategory } from "@/server/modules/category/category.service";

export type FlatCategory = AdminCategory & { depth: number };

/** Depth-first flattening of the category list (parents before children, by sort order). */
export function flattenCategories(categories: AdminCategory[]): FlatCategory[] {
  const byParent = new Map<string | null, AdminCategory[]>();
  for (const c of categories) {
    const key = c.parentId && categories.some((p) => p.id === c.parentId) ? c.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), c]);
  }
  const out: FlatCategory[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ ...c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** Ids of a category and all its descendants (cannot be chosen as its parent). */
export function descendantIds(categories: AdminCategory[], id: string): Set<string> {
  const result = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (c.parentId && result.has(c.parentId) && !result.has(c.id)) {
        result.add(c.id);
        grew = true;
      }
    }
  }
  return result;
}
