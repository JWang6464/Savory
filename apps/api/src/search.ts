import { Recipe } from "../../../packages/shared/types";

function norm(s: string): string {
  return s.trim().toLowerCase();
}

export function filterRecipes(recipes: Recipe[], opts: {
  q?: string;
  tag?: string;
  maxTimeMinutes?: number;
}): Recipe[] {
  const q = opts.q ? norm(opts.q) : undefined;
  const tag = opts.tag ? norm(opts.tag) : undefined;

  return recipes.filter((r) => {
    if (tag && !r.tags.map(norm).includes(tag)) return false;

    const totalTime =
      r.totalTimeMinutes ??
      ((r.prepTimeMinutes ?? 0) + (r.cookTimeMinutes ?? 0));

    if (opts.maxTimeMinutes !== undefined && totalTime > opts.maxTimeMinutes) {
      return false;
    }

    if (!q) return true;

    const haystack =
      [
        r.title,
        ...(r.tags ?? []),
        ...(r.ingredients ?? []).map((i) => i.name)
      ]
        .join(" ")
        .toLowerCase();

    return haystack.includes(q);
  });
}
