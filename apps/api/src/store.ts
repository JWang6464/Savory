import { Recipe } from "../../../packages/shared/types";

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
