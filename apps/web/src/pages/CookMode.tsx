import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchRecipeById } from "../api";
import Card from "../components/Card";

export default function CookMode() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<any | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps: string[] = useMemo(() => {
    if (!recipe) return [];

    if (Array.isArray(recipe.steps) && recipe.steps.every((s: any) => typeof s === "string")) {
      return recipe.steps;
    }

    if (
      Array.isArray(recipe.steps) &&
      recipe.steps.every((s: any) => typeof s?.instruction === "string")
    ) {
      return recipe.steps.map((s: any) => s.instruction);
    }

    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions;
    }

    return [];
  }, [recipe]);

  const ingredients: string[] = useMemo(() => {
    if (!recipe) return [];

    if (Array.isArray(recipe.ingredients) && recipe.ingredients.every((i: any) => typeof i === "string")) {
      return recipe.ingredients;
    }

    if (
      Array.isArray(recipe.ingredients) &&
      recipe.ingredients.every((i: any) => typeof i?.name === "string")
    ) {
      return recipe.ingredients.map((i: any) => i.name);
    }

    return [];
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
        const data = await fetchRecipeById(id);
        const r = data?.recipe ?? data;
        setRecipe(r);
        setStepIndex(0);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load recipe.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function goPrev() {
    setStepIndex(i => Math.max(0, i - 1));
  }

  function goNext() {
    setStepIndex(i => Math.min(steps.length - 1, i + 1));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (loading || error) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, error, steps.length]);

  const title = recipe?.title ?? recipe?.name ?? "Recipe";

  const currentStep =
    steps.length > 0 && stepIndex >= 0 && stepIndex < steps.length
      ? steps[stepIndex]
      : null;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">Dashboard</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link to="/search">Search</Link>
      </div>

      <h1 style={{ marginBottom: 6 }}>Cook Mode</h1>
      <p style={{ marginTop: 0, color: "#555" }}>{title}</p>

      {loading && <p>Loading...</p>}

      {error && (
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Ingredients">
            {ingredients.length === 0 ? (
              <div style={{ color: "#555" }}>No ingredients listed.</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ingredients.map((ing, idx) => (
                  <li key={`${ing}-${idx}`} style={{ marginBottom: 6 }}>
                    {ing}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Step ${steps.length === 0 ? 0 : stepIndex + 1} of ${steps.length}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 18, lineHeight: 1.4 }}>
                {currentStep ?? "No steps found for this recipe."}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                <button onClick={goPrev} disabled={stepIndex === 0}>
                  Back
                </button>
                <button
                  onClick={goNext}
                  disabled={steps.length === 0 || stepIndex >= steps.length - 1}
                >
                  Next
                </button>
                <div style={{ color: "#555", fontSize: 12 }}>
                  Use Left and Right arrow keys
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
