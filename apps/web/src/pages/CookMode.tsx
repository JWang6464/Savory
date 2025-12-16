import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchRecipeById } from "../api";

export default function CookMode() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<any | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps: string[] = useMemo(() => {
    if (!recipe) return [];

    // Support a couple shapes so Cook Mode works even if your backend returns steps differently.
    // Preferred: steps: string[]
    if (Array.isArray(recipe.steps) && recipe.steps.every((s: any) => typeof s === "string")) {
      return recipe.steps;
    }

    // Alternative: steps: { instruction: string }[]
    if (Array.isArray(recipe.steps) && recipe.steps.every((s: any) => typeof s?.instruction === "string")) {
      return recipe.steps.map((s: any) => s.instruction);
    }

    // Alternative: instructions: string[]
    if (Array.isArray(recipe.instructions)) {
      return recipe.instructions;
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

        // Backend might return { recipe: ... } or the recipe object directly.
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

  const title = recipe?.title ?? recipe?.name ?? "Recipe";

  const currentStep =
    steps.length > 0 && stepIndex >= 0 && stepIndex < steps.length
      ? steps[stepIndex]
      : null;

  function goPrev() {
    setStepIndex(i => Math.max(0, i - 1));
  }

  function goNext() {
    setStepIndex(i => Math.min(steps.length - 1, i + 1));
  }

  if (loading) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        <h1>Cook Mode</h1>
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/">Back to Dashboard</Link>
        <span style={{ margin: "0 8px" }}>|</span>
        <Link to="/search">Search</Link>
      </div>

      <h1>Cook Mode</h1>
      <h2 style={{ marginTop: 8 }}>{title}</h2>

      <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <strong>
              Step {steps.length === 0 ? 0 : stepIndex + 1} of {steps.length}
            </strong>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={goPrev} disabled={steps.length === 0 || stepIndex === 0}>
              Back
            </button>
            <button
              onClick={goNext}
              disabled={steps.length === 0 || stepIndex >= steps.length - 1}
            >
              Next
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 18, lineHeight: 1.4 }}>
          {currentStep ? (
            <div>{currentStep}</div>
          ) : (
            <div>
              No steps found for this recipe yet. Add steps when creating the recipe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
