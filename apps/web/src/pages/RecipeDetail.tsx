import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { fetchRecipeById } from "../api";

import type { Recipe } from "@savory/shared";

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeText = useMemo(() => {
    if (!recipe) return "n/a";
    return recipe.totalTimeMinutes !== undefined ? `${recipe.totalTimeMinutes} min` : "n/a";
  }, [recipe]);

  const tagText = useMemo(() => {
    if (!recipe) return "none";
    return recipe.tags.length > 0 ? recipe.tags.join(", ") : "none";
  }, [recipe]);

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Missing recipe id in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const r = await fetchRecipeById(id);
        setRecipe(r);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/">Dashboard</Link>
          <span style={{ margin: "0 8px" }}>|</span>
          <Link to="/search">Search</Link>
        </div>
        <div style={{ padding: 12, border: "1px solid #999" }}>
          Error: {error ?? "Recipe not found"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">Dashboard</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link to="/search">Search</Link>
      </div>

      <h1 style={{ marginBottom: 6 }}>{recipe.title}</h1>
      <div style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
        {timeText} · tags: {tagText}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Link to={`/cook/${recipe.id}`}>
          <button style={{ padding: "8px 12px" }}>Start Cook Mode</button>
        </Link>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        <Card title={`Ingredients (${recipe.ingredients.length})`}>
          {recipe.ingredients.length === 0 ? (
            <div style={{ color: "#555" }}>No ingredients listed.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {recipe.ingredients.map((ing, idx) => (
                <li key={`${ing.name}-${idx}`} style={{ marginBottom: 6 }}>
                  {ing.name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Steps (${recipe.steps.length})`}>
          {recipe.steps.length === 0 ? (
            <div style={{ color: "#555" }}>No steps listed.</div>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 18 }}>
              {recipe.steps
                .slice()
                .sort((a, b) => a.index - b.index)
                .map((step) => (
                  <li key={step.index} style={{ marginBottom: 10 }}>
                    {step.instruction}
                  </li>
                ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
