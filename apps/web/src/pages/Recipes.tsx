import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { fetchRecipes } from "../api";
import type { Recipe } from "@savory/shared";

function RecipeTile(props: { recipe: Recipe }) {
  const { recipe } = props;

  const timeText =
    recipe.totalTimeMinutes !== undefined ? `${recipe.totalTimeMinutes} min` : "—";

  const tagsText = recipe.tags.length > 0 ? recipe.tags.slice(0, 3).join(" • ") : "No tags";

  // Deterministic gradient based on recipe title (so it feels “designed” but needs no image upload yet)
  const gradientClass = useMemo(() => {
    const pools = [
      "from-amber-200 via-orange-100 to-emerald-100",
      "from-sky-200 via-indigo-100 to-fuchsia-100",
      "from-emerald-200 via-teal-100 to-lime-100",
      "from-rose-200 via-pink-100 to-amber-100",
      "from-violet-200 via-fuchsia-100 to-sky-100",
    ];
    let sum = 0;
    for (const ch of recipe.title) sum += ch.charCodeAt(0);
    return pools[sum % pools.length];
  }, [recipe.title]);

  return (
    <Link
      to={`/recipes/${recipe.id}/cook`}
      className="group block rounded-3xl border border-black/10 bg-white/80 shadow-sm transition hover:shadow-md"
    >
      <div className="grid grid-cols-[140px_1fr] gap-4 p-4">
        {/* Image slot */}
        <div
          className={`relative h-[96px] w-[140px] overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass}`}
        >
          <div className="absolute inset-0 opacity-35">
            <div className="absolute left-[-20%] top-[-25%] h-28 w-28 rounded-full bg-white/60 blur-2xl" />
            <div className="absolute bottom-[-25%] right-[-20%] h-28 w-28 rounded-full bg-white/50 blur-2xl" />
          </div>
          <div className="absolute left-3 top-3 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] text-zinc-700">
            {timeText}
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-700">
              {recipe.title}
            </h3>
          </div>

          <p className="mt-1 text-xs text-zinc-500">{tagsText}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-600">
            <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1">
              {recipe.ingredients.length} ingredients
            </span>
            <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1">
              {recipe.steps.length} steps
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes]);

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((e) => setError(e?.message ?? "Failed to load recipes"));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Recipes
          </h1>
          <p className="text-sm text-zinc-600">
            Your recipe library. Click any recipe to view details or Cook Mode.
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-xs text-zinc-600 backdrop-blur">
          <span className="font-semibold text-zinc-900">{recipes.length}</span>{" "}
          total
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span className="font-semibold">Error:</span> {error}
        </div>
      ) : null}

      <Card title="All recipes">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 px-4 py-10 text-center text-sm text-zinc-600">
            No recipes yet. Create one from the Dashboard.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sorted.map((r) => (
              <RecipeTile key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
