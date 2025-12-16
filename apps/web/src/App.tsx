import { useEffect, useState } from "react";
import { fetchRecipes, fetchPantry } from "./api";

type RecipesResponse = { recipes: any[] };
type PantryResponse = { pantry: any[] };

export default function App() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [pantry, setPantry] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
