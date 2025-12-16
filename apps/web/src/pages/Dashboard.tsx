import { useEffect, useState } from "react";
import {
  fetchPantry,
  fetchRecipes,
  fetchSuggestions,
  addPantryItem,
  createRecipe,
} from "../api";

export default function Dashboard() {
  const [pantry, setPantry] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const [newPantryItem, setNewPantryItem] = useState("");
  const [newRecipeName, setNewRecipeName] = useState("");

  async function loadData() {
    const pantryData = await fetchPantry();
    const recipesData = await fetchRecipes();
    const suggestionsData = await fetchSuggestions();

    setPantry(pantryData);
    setRecipes(recipesData);
    setSuggestions(suggestionsData);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAddPantryItem() {
    const name = newPantryItem.trim();
    if (!name) return;

    await addPantryItem({ name });
    setNewPantryItem("");
    loadData();
  }

  async function handleAddRecipe() {
    const name = newRecipeName.trim();
    if (!name) return;

    await createRecipe({
      name,
      ingredients: [],
      steps: [],
      tags: [],
      timeMinutes: 0,
    });

    setNewRecipeName("");
    loadData();
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Savory</h1>

      <section>
        <h2>Pantry</h2>
        <ul>
          {pantry.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>

        <input
          value={newPantryItem}
          onChange={e => setNewPantryItem(e.target.value)}
          placeholder="New pantry item"
        />
        <button onClick={handleAddPantryItem}>Add</button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Recipes</h2>
        <ul>
          {recipes.map(recipe => (
            <li key={recipe.id}>{recipe.name}</li>
          ))}
        </ul>

        <input
          value={newRecipeName}
          onChange={e => setNewRecipeName(e.target.value)}
          placeholder="New recipe name"
        />
        <button onClick={handleAddRecipe}>Add</button>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Suggestions</h2>
        <ul>
          {suggestions.map((s: any) => (
            <li key={s.recipe.id}>
              {s.recipe.name} ({s.matchPercent}% match)
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
