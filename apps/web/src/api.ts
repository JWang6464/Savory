import type { IngredientLine, PantryItem, Recipe, RecipeStep } from "@savory/shared";

const API_BASE = "http://localhost:3001";

function unwrapList<T>(data: any, keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  for (const k of keys) {
    if (Array.isArray(data?.[k])) return data[k] as T[];
  }
  return [];
}

function unwrapObject<T>(data: any, keys: string[]): T {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    for (const k of keys) {
      if (data?.[k]) return data[k] as T;
    }
  }
  return data as T;
}

// ---------- Recipes ----------

export async function fetchRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  const data = await res.json();
  return unwrapList<Recipe>(data, ["recipes", "results"]);
}

export async function fetchRecipeById(id: string): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) throw new Error("Failed to fetch recipe");
  const data = await res.json();
  return unwrapObject<Recipe>(data, ["recipe"]);
}

export async function createRecipe(input: {
  title: string;
  ingredients: IngredientLine[];
  steps: RecipeStep[];
  tags: string[];
  totalTimeMinutes?: number;
}): Promise<Recipe> {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) throw new Error("Failed to create recipe");
  const data = await res.json();
  return unwrapObject<Recipe>(data, ["recipe"]);
}

export async function deleteRecipe(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/recipes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete recipe");
}


// ---------- Pantry ----------

export async function fetchPantry(): Promise<PantryItem[]> {
  const res = await fetch(`${API_BASE}/pantry`);
  if (!res.ok) throw new Error("Failed to fetch pantry");
  const data = await res.json();
  return unwrapList<PantryItem>(data, ["pantry", "items"]);
}

export async function addPantryItem(item: {
  name: string;
  haveState?: "have" | "dont_have";
}): Promise<PantryItem> {
  const res = await fetch(`${API_BASE}/pantry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: item.name,
      haveState: item.haveState ?? "have",
    }),
  });

  if (!res.ok) throw new Error("Failed to add pantry item");
  const data = await res.json();
  return unwrapObject<PantryItem>(data, ["item"]);
}

// ---------- Discovery ----------

export type RecipeSuggestion = {
  recipe: Recipe;
  matchPercent: number;
  missingIngredients: string[];
};

export async function fetchSuggestions(): Promise<RecipeSuggestion[]> {
  const res = await fetch(`${API_BASE}/recipes/suggestions`);
  if (!res.ok) throw new Error("Failed to fetch suggestions");
  const data = await res.json();

  if (Array.isArray(data)) return data as RecipeSuggestion[];
  if (Array.isArray(data?.suggestions)) return data.suggestions as RecipeSuggestion[];
  return [];
}

export async function searchRecipes(params: {
  q?: string;
  tag?: string;
  maxTimeMinutes?: number;
}): Promise<Recipe[]> {
  const searchParams = new URLSearchParams();

  if (params.q) searchParams.set("q", params.q);
  if (params.tag) searchParams.set("tag", params.tag);
  if (params.maxTimeMinutes !== undefined) {
    searchParams.set("maxTimeMinutes", String(params.maxTimeMinutes));
  }

  const res = await fetch(`${API_BASE}/recipes/search?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to search recipes");

  const data = await res.json();
  return unwrapList<Recipe>(data, ["recipes", "results"]);
}
