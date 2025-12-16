import { useState } from "react";
import { searchRecipes } from "../api";

export default function Search() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [maxTimeMinutes, setMaxTimeMinutes] = useState<string>("");

  const [results, setResults] = useState<any[]>([]);
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

      const data = await searchRecipes({
        q: q.trim() || undefined,
        tag: tag.trim() || undefined,
        maxTimeMinutes: max,
      });

      // Backend might return either an array or an object wrapper depending on your implementation.
      const list = Array.isArray(data) ? data : data.recipes ?? data.results ?? [];
      setResults(list);
    } catch (e: any) {
      setError(e?.message ?? "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Search Recipes</h1>

      <div style={{ display: "grid", gap: 8, maxWidth: 520, marginTop: 12 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search query (example: chicken, noodles)"
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
          placeholder="Max time in minutes (optional, example: 20)"
          style={{ padding: 8 }}
        />

        <button onClick={runSearch} style={{ padding: "8px 12px" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, border: "1px solid #999", marginTop: 16 }}>
          Error: {error}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h2>Results ({results.length})</h2>
        <ul>
          {results.map(r => (
            <li key={r.id}>{r.title ?? r.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
