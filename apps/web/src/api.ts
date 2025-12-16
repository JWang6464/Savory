const API_BASE = "http://localhost:3001";

export async function fetchRecipes() {
  const res = await fetch(`${API_BASE}/recipes`);
  if (!res.ok) throw new Error("Failed to fetch recipes");
  return res.json();
}

export async function fetchPantry() {
  const res = await fetch(`${API_BASE}/pantry`);
  if (!res.ok) throw new Error("Failed to fetch pantry");
  return res.json();
}
