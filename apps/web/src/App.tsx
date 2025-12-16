import { useEffect, useState } from "react";
import { fetchRecipes, fetchPantry } from "./api";

type RecipesResponse = { recipes: any[] };
type PantryResponse = { pantry: any[] };
type SuggestionsResponse = { suggestions: any[] };

export default function App() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [pantryName, setPantryName] = useState("");
  const [haveState, setHaveState] = useState<"have" | "dont_have">("have");

  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState("");
  const [recipeSteps, setRecipeSteps] = useState("");

  async function refreshAll() {
    const r: RecipesResponse = await fetchRecipes();
    const p: PantryResponse = await fetchPantry();
    setRecipes(r.recipes);
    setPantry(p.pantry);

    const sRes = await fetch("http://localhost:3001/recipes/suggestions");
    const s: SuggestionsResponse = await sRes.json();
    setSuggestions(s.suggestions ?? []);
  }

  useEffect(() => {
    refreshAll().catch((e) => setError(e.message ?? "Unknown error"));
  }, []);

  async function addPantryItem() {
    setError(null);

    const res = await fetch("http://localhost:3001/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pantryName, haveState })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to add pantry item");
    }

    setPantryName("");
    await refreshAll();
  }

  async function createRecipe() {
    setError(null);

    const ingredients = recipeIngredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const steps = recipeSteps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((instruction) => ({ instruction }));

    const res = await fetch("http://localhost:3001/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: recipeTitle,
        ingredients,
        steps,
        tags: []
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to create recipe");
    }

    setRecipeTitle("");
    setRecipeIngredients("");
    setRecipeSteps("");
    await refreshAll();
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Savory</h1>
      <p>Recipe vault and pantry-aware cooking copilot.</p>

      {error && (
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Recipes ({recipes.length})</h2>

          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            <input
              value={recipeTitle}
              onChange={(e) => setRecipeTitle(e.target.value)}
              placeholder="Recipe title"
              style={{ padding: 8 }}
            />
            <input
              value={recipeIngredients}
              onChange={(e) => setRecipeIngredients(e.target.value)}
              placeholder="Ingredients (comma separated)"
              style={{ padding: 8 }}
            />
            <textarea
              value={recipeSteps}
              onChange={(e) => setRecipeSteps(e.target.value)}
              placeholder={"Steps (one per line)\nExample:\nHeat pan\nAdd eggs\nAdd rice"}
              style={{ padding: 8, minHeight: 120 }}
            />
            <button
              onClick={() => createRecipe().catch((e) => setError(e.message))}
              disabled={!recipeTitle.trim()}
              style={{ padding: "8px 12px" }}
            >
              Create recipe
            </button>
          </div>

          <ul>
            {recipes.map((r) => (
              <li key={r.id}>{r.title}</li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Pantry ({pantry.length})</h2>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={pantryName}
              onChange={(e) => setPantryName(e.target.value)}
              placeholder="Add ingredient (eg rice)"
              style={{ flex: 1, padding: 8 }}
            />
            <select
              value={haveState}
              onChange={(e) => setHaveState(e.target.value as any)}
              style={{ padding: 8 }}
            >
              <option value="have">have</option>
              <option value="dont_have">dont have</option>
            </select>
            <button
              onClick={() => addPantryItem().catch((e) => setError(e.message))}
              disabled={!pantryName.trim()}
              style={{ padding: "8px 12px" }}
            >
              Add
            </button>
          </div>

          <ul>
            {pantry.map((p) => (
              <li key={p.id}>
                {p.name} ({p.haveState})
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
        <h2>Suggestions</h2>
        <ul>
          {suggestions.map((s) => (
            <li key={s.recipe?.id}>
              {s.recipe?.title} - {s.matchPercent}% match
              {Array.isArray(s.missingIngredients) && s.missingIngredients.length > 0 && (
                <span> (missing: {s.missingIngredients.join(", ")})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
