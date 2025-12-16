import { useEffect, useState } from "react";
import { fetchRecipes, fetchPantry } from "./api";

type RecipesResponse = { recipes: any[] };
type PantryResponse = { pantry: any[] };

export default function App() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [pantryName, setPantryName] = useState("");
  const [haveState, setHaveState] = useState<"have" | "dont_have">("have");

  useEffect(() => {
    async function load() {
      try {
        const r: RecipesResponse = await fetchRecipes();
        const p: PantryResponse = await fetchPantry();
        setRecipes(r.recipes);
        setPantry(p.pantry);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      }
    }
    load();
  }, []);

  async function addPantryItem() {
    setError(null);

    const res = await fetch("http://localhost:3001/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: pantryName,
        haveState
      })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to add pantry item");
    }

    setPantryName("");
    const p: PantryResponse = await fetchPantry();
    setPantry(p.pantry);
  }

  return (
    <div style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
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
              <option value="Have">Have</option>
              <option value="Don't Have">Don't Have</option>
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
    </div>
  );
}
