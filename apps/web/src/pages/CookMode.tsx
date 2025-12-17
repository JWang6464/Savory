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
        <Card title={`Step ${steps.length === 0 ? 0 : stepIndex + 1} of ${steps.length}`}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 18, lineHeight: 1.4 }}>
              {currentStep ?? "No steps found for this recipe."}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={goPrev} disabled={stepIndex === 0}>
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
        </Card>
      )}
    </div>
  );
}
