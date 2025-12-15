import { Recipe, PantryItem } from "../../../packages/shared/types";

/* =========================
   Recipe Store
========================= */

const recipes = new Map<string, Recipe>();

export function saveRecipe(recipe: Recipe): void {
  recipes.set(recipe.id, recipe);
}

export function listRecipes(): Recipe[] {
  return Array.from(recipes.values());
}

export function getRecipe(id: string): Recipe | undefined {
  return recipes.get(id);
}

export function deleteRecipe(id: string): boolean {
  return recipes.delete(id);
}

/* =========================
   Pantry Store
========================= */

const pantry = new Map<string, PantryItem>();

export function savePantryItem(item: PantryItem): void {
  pantry.set(item.id, item);
}

export function listPantryItems(): PantryItem[] {
  return Array.from(pantry.values());
}

export function deletePantryItem(id: string): boolean {
  return pantry.delete(id);
}
