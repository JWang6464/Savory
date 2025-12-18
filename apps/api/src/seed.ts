import crypto from "crypto";
import type { Recipe } from "../../../packages/shared/types";
import { saveRecipe, listRecipes } from "./store";

function nowIso() {
  return new Date().toISOString();
}

function makeRecipe(input: {
  title: string;
  ingredients: string[];
  steps: string[];
  tags?: string[];
  totalTimeMinutes?: number;
}): Recipe {
  const now = nowIso();

  return {
    id: crypto.randomUUID(),
    title: input.title,
    description: undefined,
    sourceUrl: undefined,
    servings: undefined,
    prepTimeMinutes: undefined,
    cookTimeMinutes: undefined,
    totalTimeMinutes: input.totalTimeMinutes,
    ingredients: input.ingredients.map((name) => ({ name })),
    steps: input.steps.map((instruction, index) => ({
      index,
      instruction,
    })),
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export function seedIfEmpty() {
  if (listRecipes().length > 0) return;

  const seeds: Array<{
    title: string;
    ingredients: string[];
    steps: string[];
    tags?: string[];
    totalTimeMinutes?: number;
  }> = [
    {
      title: "Egg Fried Rice",
      ingredients: ["rice", "eggs", "soy sauce", "scallions", "oil", "salt"],
      steps: [
        "Heat a pan with oil.",
        "Scramble eggs and set aside.",
        "Add rice and break up clumps.",
        "Add soy sauce and salt, stir well.",
        "Stir in eggs and scallions, serve.",
      ],
      tags: ["quick", "asian"],
      totalTimeMinutes: 15,
    },
    {
      title: "Garlic Butter Pasta",
      ingredients: ["pasta", "garlic", "butter", "parmesan", "salt", "pepper"],
      steps: [
        "Boil pasta in salted water until al dente.",
        "Melt butter and sauté garlic briefly.",
        "Toss pasta with garlic butter.",
        "Add parmesan and pepper, serve.",
      ],
      tags: ["quick", "comfort"],
      totalTimeMinutes: 20,
    },
    {
      title: "Chicken Stir Fry",
      ingredients: ["chicken", "soy sauce", "garlic", "ginger", "broccoli", "oil"],
      steps: [
        "Slice chicken and prep vegetables.",
        "Stir fry chicken until browned.",
        "Add garlic and ginger, cook briefly.",
        "Add broccoli and a splash of water, cover to steam.",
        "Add soy sauce, toss, serve.",
      ],
      tags: ["protein", "asian"],
      totalTimeMinutes: 25,
    },
  ];

  for (const s of seeds) {
    saveRecipe(makeRecipe(s));
  }
}
