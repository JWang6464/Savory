// Shared data types for Savory
// These types define the v1 contract used by the backend and frontend

export type ISODateString = string;

export interface IngredientLine {
  name: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  optional?: boolean;
}

export interface RecipeStep {
  index: number;
  instruction: string;
  timerSeconds?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  sourceUrl?: string;

  servings?: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;

  ingredients: IngredientLine[];
  steps: RecipeStep[];

  tags: string[];

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type PantryHaveState = "have" | "dont_have";

export interface PantryItem {
  id: string;
  name: string;
  haveState: PantryHaveState;
  quantity?: number;
  unit?: string;
  expiresAt?: ISODateString;
  updatedAt: ISODateString;
}
