import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { searchRecipes } from "../api";

import type { Recipe } from "@savory/shared";

export default function Search() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<string>("");

  const [results, setResults] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setError(null);
    setLoading(true);
 
    try {
      const max =
        maxTimeMinutes.trim() === "" ? undefined : Number(maxTimeMinutes);

      if (max !== undefined && Number.isNaN(max)) {
        setError("Max time must be a number.");
        setLoading(false);
        return;
      }

      const list = await searchRecipes({
        q: q.trim() || undefined,
        tag: tag.trim() || undefined,
        maxTimeMinutes: max,
      });

      setResults(list);
    } catch (e: any) {
      setError(e?.message ?? "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Search</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Search your recipe vault by keyword, tag, or time.
      </p>

      {error && (
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Card title="Filters">
          <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Query (example: chicken, noodles)"
              style={{ padding: 8 }}
            />

            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="Tag (optional, example: spicy)"
              style={{ padding: 8 }}
            />

            <input
              value={maxTimeMinutes}
              onChange={e => setMaxTimeMinutes(e.target.value)}
              placeholder="Max time minutes (optional, example: 20)"
              style={{ padding: 8 }}
            />

            <button onClick={runSearch} style={{ padding: "8px 12px" }}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card title={`Results (${results.length})`}>
          {results.length === 0 ? (
            <div style={{ color: "#555" }}>Run a search to see results.</div>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {results.map(r => {
                const tagText = r.tags.length > 0 ? r.tags.join(", ") : "none";
                const timeText =
                  r.totalTimeMinutes !== undefined ? `${r.totalTimeMinutes} min` : "n/a";

                return (
                  <li key={r.id} style={{ marginBottom: 10 }}>
                    <div>
                      <Link to={`/recipes/${r.id}`}>{r.title}</Link>
                    </div>
                    <div style={{ color: "#555", fontSize: 12 }}>
                      {r.ingredients.length} ingredients, {r.steps.length} steps, {timeText}, tags: {tagText}
                    </div>
                  </li>
                );
              })}

            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
