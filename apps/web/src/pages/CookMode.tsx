import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { fetchRecipeById } from "../api";

import type { Recipe } from "../../../../packages/shared/types";

export default function CookMode() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo(() => recipe?.steps ?? [], [recipe]);
  const ingredients = useMemo(() => recipe?.ingredients ?? [], [recipe]);

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

  const title = recipe?.title ?? "Recipe";

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

      {!loading && !error && recipe && (
        <div style={{ display: "grid", gap: 16 }}>
          <Card title="Ingredients">
            {ingredients.length === 0 ? (
              <div style={{ color: "#555" }}>No ingredients listed.</div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {ingredients.map((ing, idx) => (
                  <li key={`${ing.name}-${idx}`} style={{ marginBottom: 6 }}>
                    {ing.name}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Step ${steps.length === 0 ? 0 : stepIndex + 1} of ${steps.length}`}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 18, lineHeight: 1.4 }}>
                {currentStep?.instruction ?? "No steps found for this recipe."}
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
