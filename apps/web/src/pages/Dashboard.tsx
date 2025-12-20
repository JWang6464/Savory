import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import {
  addPantryItem,
  createRecipe,
  deleteRecipe,
  updateRecipe,
  fetchPantry,
  fetchRecipes,
  fetchSuggestions,
} from "../api";

import type {
  IngredientLine,
  PantryItem,
  Recipe,
  RecipeStep,
} from "@savory/shared";
import type { RecipeSuggestion } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newPantryItem, setNewPantryItem] = useState("");

  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [newRecipeIngredients, setNewRecipeIngredients] = useState("");
  const [newRecipeSteps, setNewRecipeSteps] = useState("");
  const [newRecipeTags, setNewRecipeTags] = useState("");
  const [newRecipeTotalTimeMinutes, setNewRecipeTotalTimeMinutes] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editTotalTimeMinutes, setEditTotalTimeMinutes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  async function loadData() {
    const pantryData = await fetchPantry();
    const recipesData = await fetchRecipes();
    const suggestionsData = await fetchSuggestions();

    setPantry(pantryData);
    setRecipes(recipesData);
    setSuggestions(suggestionsData);
  }

  useEffect(() => {
    loadData().catch((e) => setError(e?.message ?? "Failed to load data"));
  }, []);

  async function handleAddPantryItem() {
    setError(null);

    const name = newPantryItem.trim();
    if (!name) return;

    await addPantryItem({ name });
    setNewPantryItem("");
    loadData();
  }

  async function handleAddRecipe() {
    setError(null);

    const title = newRecipeTitle.trim();
    if (!title) return;

    const ingredients: IngredientLine[] = newRecipeIngredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const steps: RecipeStep[] = newRecipeSteps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((instruction, index) => ({ index, instruction }));

    const tags = newRecipeTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const totalTimeMinutes =
      newRecipeTotalTimeMinutes.trim() === ""
        ? undefined
        : Number(newRecipeTotalTimeMinutes);

    if (totalTimeMinutes !== undefined && Number.isNaN(totalTimeMinutes)) {
      setError("Total time minutes must be a number.");
      return;
    }

    await createRecipe({
      title,
      ingredients,
      steps,
      tags,
      totalTimeMinutes,
    });

    setNewRecipeTitle("");
    setNewRecipeIngredients("");
    setNewRecipeSteps("");
    setNewRecipeTags("");
    setNewRecipeTotalTimeMinutes("");

    loadData();
  }

  function startEdit(recipe: Recipe) {
    setError(null);
    setEditingId(recipe.id);
    setEditTitle(recipe.title);
    setEditTags(recipe.tags.join(", "));
    setEditTotalTimeMinutes(
      recipe.totalTimeMinutes !== undefined ? String(recipe.totalTimeMinutes) : ""
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditTags("");
    setEditTotalTimeMinutes("");
  }

  async function saveEdit() {
    if (isSavingEdit) return;
    if (!editingId) return;

    const title = editTitle.trim();
    if (!title) {
      setError("Title cannot be empty.");
      return;
    }

    const tags = editTags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const totalTimeMinutes =
      editTotalTimeMinutes.trim() === ""
        ? undefined
        : Number(editTotalTimeMinutes);

    if (totalTimeMinutes !== undefined && Number.isNaN(totalTimeMinutes)) {
      setError("Total time minutes must be a number.");
      return;
    }

    setIsSavingEdit(true);
    try {
      setError(null);
      await updateRecipe(editingId, { title, tags, totalTimeMinutes });
      cancelEdit();
      await loadData();
    } catch (e: any) {
      setError(e?.message ?? "Failed to save");
    } finally {
      setIsSavingEdit(false);
    }
  }

  const recipesCount = recipes.length;
  const pantryCount = pantry.length;

  const sortedSuggestions = useMemo(() => {
    return [...suggestions].sort((a, b) => b.matchPercent - a.matchPercent);
  }, [suggestions]);

  const featured = useMemo(() => {
    if (recipes.length === 0) return null;
    // choose the fastest recipe if time exists, otherwise first
    const withTime = recipes.filter((r) => r.totalTimeMinutes !== undefined);
    if (withTime.length > 0) {
      return [...withTime].sort(
        (a, b) => (a.totalTimeMinutes ?? 0) - (b.totalTimeMinutes ?? 0)
      )[0];
    }
    return recipes[0];
  }, [recipes]);

  const inputBase =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5";
  const textareaBase =
    "w-full min-h-[120px] rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5";
  const buttonPrimary =
    "inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";
  const buttonNeutral =
    "inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50";
  const buttonDanger =
    "inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-6">
      {/* Header + counts */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Dashboard
            </h1>
            <p className="text-sm text-zinc-600">
              Recipe vault and pantry-aware cooking copilot.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-xs text-zinc-600 backdrop-blur">
            <span className="font-semibold text-zinc-900">{recipesCount}</span>{" "}
            recipes
            <span className="mx-1 text-black/10">|</span>
            <span className="font-semibold text-zinc-900">{pantryCount}</span>{" "}
            pantry items
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <span className="font-semibold">Error:</span> {error}
          </div>
        ) : null}
      </div>

      {/* Featured hero */}
      {featured ? (
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-sm backdrop-blur">
          <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
            {/* image placeholder */}
            <div className="relative min-h-[220px] bg-gradient-to-br from-amber-200 via-orange-100 to-emerald-100">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute left-[-20%] top-[-30%] h-72 w-72 rounded-full bg-white/60 blur-3xl" />
                <div className="absolute bottom-[-25%] right-[-20%] h-72 w-72 rounded-full bg-white/50 blur-3xl" />
              </div>
              <div className="absolute left-5 top-5 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs text-zinc-700">
                Featured
              </div>
            </div>

            {/* details */}
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                {featured.totalTimeMinutes !== undefined ? (
                  <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1">
                    {featured.totalTimeMinutes} min
                  </span>
                ) : null}
                <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1">
                  {featured.ingredients.length} ingredients
                </span>
                <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1">
                  {featured.steps.length} steps
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                {featured.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Jump in with Cook Mode or view details. Later we can attach real
                recipe images.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to={`/recipes/${featured.id}/cook`} className={buttonPrimary}>
                  Open recipe
                </Link>
                <Link to={`/recipes/${featured.id}`} className={buttonNeutral}>
                  View details
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card
          title={`Recipes (${recipes.length})`}
          right={
            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-zinc-600">
              CRUD enabled
            </span>
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3">
              <input
                value={newRecipeTitle}
                onChange={(e) => setNewRecipeTitle(e.target.value)}
                placeholder="Recipe title"
                className={inputBase}
              />

              <input
                value={newRecipeIngredients}
                onChange={(e) => setNewRecipeIngredients(e.target.value)}
                placeholder="Ingredients (comma separated)"
                className={inputBase}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={newRecipeTags}
                  onChange={(e) => setNewRecipeTags(e.target.value)}
                  placeholder="Tags (comma separated, optional)"
                  className={inputBase}
                />

                <input
                  value={newRecipeTotalTimeMinutes}
                  onChange={(e) => setNewRecipeTotalTimeMinutes(e.target.value)}
                  placeholder="Total time (min, optional)"
                  className={inputBase}
                />
              </div>

              <textarea
                value={newRecipeSteps}
                onChange={(e) => setNewRecipeSteps(e.target.value)}
                placeholder={
                  "Steps (one per line)\nExample:\nHeat pan\nAdd eggs\nServe"
                }
                className={textareaBase}
              />

              <button
                onClick={() =>
                  handleAddRecipe().catch((e) =>
                    setError(e?.message ?? "Failed to create recipe")
                  )
                }
                disabled={!newRecipeTitle.trim()}
                className={buttonPrimary}
              >
                Create recipe
              </button>

              <div className="h-px bg-black/5" />
            </div>

            <ul className="space-y-3">
              {recipes.map((recipe) => {
                const tagText =
                  recipe.tags.length > 0 ? recipe.tags.join(", ") : "none";
                const timeText =
                  recipe.totalTimeMinutes !== undefined
                    ? `${recipe.totalTimeMinutes} min`
                    : "n/a";

                return (
                  <li
                    key={recipe.id}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        {editingId === recipe.id ? (
                          <div className="grid gap-2">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Title"
                              className={inputBase}
                            />

                            <div className="grid gap-2 sm:grid-cols-2">
                              <input
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                                placeholder="Tags (comma separated)"
                                className={inputBase}
                              />

                              <input
                                value={editTotalTimeMinutes}
                                onChange={(e) =>
                                  setEditTotalTimeMinutes(e.target.value)
                                }
                                placeholder="Total time (optional)"
                                className={inputBase}
                              />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => saveEdit()}
                                className={buttonPrimary}
                                disabled={isSavingEdit}
                              >
                                {isSavingEdit ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={cancelEdit}
                                className={buttonNeutral}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="min-w-0">
                              <Link
                                to={`/recipes/${recipe.id}`}
                                className="truncate text-sm font-semibold text-zinc-900 hover:text-zinc-700"
                              >
                                {recipe.title}
                              </Link>
                            </div>
                            <div className="mt-1 text-xs text-zinc-500">
                              {recipe.ingredients.length} ingredients,{" "}
                              {recipe.steps.length} steps, {timeText}, tags:{" "}
                              {tagText}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {editingId === recipe.id ? null : (
                          <button
                            onClick={() => startEdit(recipe)}
                            className={buttonNeutral}
                          >
                            Edit
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const ok = window.confirm(
                              `Delete "${recipe.title}"?`
                            );
                            if (!ok) return;

                            deleteRecipe(recipe.id)
                              .then(() => loadData())
                              .catch((e) =>
                                setError(e?.message ?? "Failed to delete recipe")
                              );
                          }}
                          className={buttonDanger}
                          disabled={editingId === recipe.id}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>

        <Card title={`Pantry (${pantry.length})`}>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={newPantryItem}
                onChange={(e) => setNewPantryItem(e.target.value)}
                placeholder="Add pantry item (example: rice)"
                className={inputBase}
              />
              <button
                onClick={() =>
                  handleAddPantryItem().catch((e) =>
                    setError(e?.message ?? "Failed to add pantry item")
                  )
                }
                disabled={!newPantryItem.trim()}
                className={buttonPrimary}
              >
                Add
              </button>
            </div>

            {pantry.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 px-4 py-8 text-center text-sm text-zinc-600">
                Your pantry is empty. Add items like <span className="font-medium">rice</span>,{" "}
                <span className="font-medium">eggs</span>, or{" "}
                <span className="font-medium">soy sauce</span>.
              </div>
            ) : (
              <ul className="space-y-2">
                {pantry.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2 shadow-sm"
                  >
                    <span className="text-sm text-zinc-900">{item.name}</span>
                    <span className="text-xs text-zinc-500">
                      {item.haveState}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Card title="Suggestions">
        <ul className="grid gap-2 sm:grid-cols-2">
          {sortedSuggestions.map((s) => (
            <li
              key={s.recipe.id}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm"
            >
              <span className="text-sm font-medium text-zinc-900">
                {s.recipe.title}
              </span>
              <span className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
                {s.matchPercent}% match
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
