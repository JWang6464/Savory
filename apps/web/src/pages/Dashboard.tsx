import { useEffect, useState } from "react";
import { fetchPantry, fetchRecipes, fetchSuggestions, addPantryItem, createRecipe } from "../api";

export default function Dashboard() {
  const [pantry, setPantry] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newPantryItem, setNewPantryItem] = useState("");

  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeIngredients, setNewRecipeIngredients] = useState("");
  const [newRecipeSteps, setNewRecipeSteps] = useState("");

  async function loadData() {
    const pantryData = await fetchPantry();
    const recipesData = await fetchRecipes();
    const suggestionsData = await fetchSuggestions();

    setPantry(pantryData);
    setRecipes(recipesData);
    setSuggestions(suggestionsData);
  }

  useEffect(() => {
    loadData().catch(e => setError(e?.message ?? "Failed to load data"));
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

    const name = newRecipeName.trim();
    if (!name) return;

    const ingredients = newRecipeIngredients
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const steps = newRecipeSteps
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    await createRecipe({
      name,
      ingredients,
      steps,
      tags: [],
      timeMinutes: 0,
    });

    setNewRecipeName("");
    setNewRecipeIngredients("");
    setNewRecipeSteps("");
    loadData();
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
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
              value={newRecipeName}
              onChange={e => setNewRecipeName(e.target.value)}
              placeholder="Recipe name"
              style={{ padding: 8 }}
            />

            <input
              value={newRecipeIngredients}
              onChange={e => setNewRecipeIngredients(e.target.value)}
              placeholder="Ingredients (comma separated)"
              style={{ padding: 8 }}
            />

            <textarea
              value={newRecipeSteps}
              onChange={e => setNewRecipeSteps(e.target.value)}
              placeholder={"Steps (one per line)\nExample:\nHeat pan\nAdd eggs\nServe"}
              style={{ padding: 8, minHeight: 120 }}
            />

            <button
              onClick={() => handleAddRecipe().catch(e => setError(e?.message ?? "Failed to create recipe"))}
              disabled={!newRecipeName.trim()}
              style={{ padding: "8px 12px" }}
            >
              Create recipe
            </button>
          </div>

          <ul>
            {recipes.map(recipe => (
              <li key={recipe.id}>
                <a href={`/recipes/${recipe.id}`}>{recipe.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>Pantry ({pantry.length})</h2>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={newPantryItem}
              onChange={e => setNewPantryItem(e.target.value)}
              placeholder="Add pantry item (example: rice)"
              style={{ flex: 1, padding: 8 }}
            />
            <button
              onClick={() => handleAddPantryItem().catch(e => setError(e?.message ?? "Failed to add pantry item"))}
              disabled={!newPantryItem.trim()}
              style={{ padding: "8px 12px" }}
            >
              Add
            </button>
          </div>

          <ul>
            {pantry.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ border: "1px solid #ddd", padding: 16, marginTop: 16 }}>
        <h2>Suggestions</h2>
        <ul>
          {suggestions.map((s: any) => (
            <li key={s.recipe.id}>
              {s.recipe.name} ({s.matchPercent}% match)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
