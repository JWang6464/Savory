const API_BASE = "http://localhost:3001";

// ---------- Recipes ----------

export async function fetchRecipes() {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function createRecipe(recipe: {
  name: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
  timeMinutes: number;
}) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe),
  });

  if (!res.ok) throw new Error("Failed to create recipe");
  return res.json();
}

export async function fetchRecipeById(id: string) {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch recipe");
  return res.json();
}

// ---------- Pantry ----------

export async function fetchPantry() {
  const res = await fetch(`${API_BASE}/pantry`);
  if (!res.ok) throw new Error("Failed to fetch pantry");
  return res.json();
}

export async function addPantryItem(item: { name: string }) {
  const res = await fetch(`${API_BASE}/pantry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!res.ok) throw new Error("Failed to add pantry item");
  return res.json();
}

// ---------- Discovery ----------

export async function fetchSuggestions() {
  const res = await fetch(`${API_BASE}/recipes/suggestions`);
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  return res.json();
}

export async function searchRecipes(params: {
  q?: string;
  tag?: string;
  maxTimeMinutes?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.maxTimeMinutes !== undefined) {
    searchParams.set("maxTimeMinutes", String(params.maxTimeMinutes));
  }

  const res = await fetch(
    `${API_BASE}/recipes/search?${searchParams.toString()}`
  );

  if (!res.ok) throw new Error("Failed to search recipes");
  return res.json();
}
