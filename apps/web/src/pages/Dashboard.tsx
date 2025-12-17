import { useEffect, useState } from "react";
import Card from "../components/Card";
import {
  addPantryItem,
  createRecipe,
  fetchPantry,
  fetchRecipes,
  fetchSuggestions,
} from "../api";

import type { IngredientLine, PantryItem, Recipe, RecipeStep } from "../../../../packages/shared/types";
import type { RecipeSuggestion } from "../api";

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

    const title = newRecipeTitle.trim();
    if (!title) return;

    const ingredients: IngredientLine[] = newRecipeIngredients
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({ name }));

    const steps: RecipeStep[] = newRecipeSteps
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
      .map((instruction, index) => ({ index, instruction }));

    const tags = newRecipeTags
      .split(",")
      .map(s => s.trim())
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

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Savory</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Recipe vault and pantry-aware cooking copilot.
      </p>

      {error && (
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <Card title={`Recipes (${recipes.length})`}>
          <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
            <input
              value={newRecipeTitle}
              onChange={e => setNewRecipeTitle(e.target.value)}
              placeholder="Recipe title"
              style={{ padding: 8 }}
            />

            <input
              value={newRecipeIngredients}
              onChange={e => setNewRecipeIngredients(e.target.value)}
              placeholder="Ingredients (comma separated)"
              style={{ padding: 8 }}
            />

            <input
              value={newRecipeTags}
              onChange={e => setNewRecipeTags(e.target.value)}
              placeholder="Tags (comma separated, optional)"
              style={{ padding: 8 }}
            />

            <input
              value={newRecipeTotalTimeMinutes}
              onChange={e => setNewRecipeTotalTimeMinutes(e.target.value)}
              placeholder="Total time minutes (optional, example: 20)"
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
              disabled={!newRecipeTitle.trim()}
              style={{ padding: "8px 12px" }}
            >
              Create recipe
            </button>
          </div>

          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {recipes.map(recipe => {
              const tagText = recipe.tags.length > 0 ? recipe.tags.join(", ") : "none";
              const timeText =
                recipe.totalTimeMinutes !== undefined
                  ? `${recipe.totalTimeMinutes} min`
                  : "n/a";

              return (
                <li key={recipe.id} style={{ marginBottom: 10 }}>
                  <div>
                    <a href={`/recipes/${recipe.id}`}>{recipe.title}</a>
                  </div>
                  <div style={{ color: "#555", fontSize: 12 }}>
                    {recipe.ingredients.length} ingredients,{" "}
                    {recipe.steps.length} steps, {timeText}, tags: {tagText}
                  </div>
                </li>
              );
            })}
          </ul>

        </Card>

        <Card title={`Pantry (${pantry.length})`}>
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

          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {pantry.map(item => (
              <li key={item.id} style={{ marginBottom: 6 }}>
                {item.name} ({item.haveState})
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title="Suggestions">
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {suggestions.map(s => (
              <li key={s.recipe.id} style={{ marginBottom: 6 }}>
                {s.recipe.title} ({s.matchPercent}% match)
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
