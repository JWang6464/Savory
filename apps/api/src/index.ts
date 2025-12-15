import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Recipe, PantryItem } from "../../../packages/shared/types";
import {
  saveRecipe,
  listRecipes,
  getRecipe,
  deleteRecipe,
  savePantryItem,
  listPantryItems,
  deletePantryItem
} from "./store";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   Health
========================= */

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   Pantry
========================= */

app.get("/pantry", (_req, res) => {
  res.json({ pantry: listPantryItems() });
});

app.post("/pantry", (req, res) => {
  const body = req.body as Partial<PantryItem>;

  if (!body.name || typeof body.name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  if (body.haveState !== "have" && body.haveState !== "dont_have") {
    return res
      .status(400)
      .json({ error: "haveState must be 'have' or 'dont_have'" });
  }

  const now = new Date().toISOString();

  const item: PantryItem = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    haveState: body.haveState,
    quantity: body.quantity,
    unit: body.unit,
    expiresAt: body.expiresAt,
    updatedAt: now
  };

  savePantryItem(item);
  res.status(201).json(item);
});

app.delete("/pantry/:id", (req, res) => {
  const ok = deletePantryItem(req.params.id);
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).send();
});

/* =========================
   Recipes
========================= */

// Create recipe
app.post("/recipes", (req, res) => {
  const body = req.body as Partial<Recipe>;

  if (!body.title) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) {
    return res.status(400).json({ error: "ingredients are required" });
  }
  if (!Array.isArray(body.steps) || body.steps.length === 0) {
    return res.status(400).json({ error: "steps are required" });
  }

  const now = new Date().toISOString();

  const recipe: Recipe = {
    id: crypto.randomUUID(),
    title: body.title,
    description: body.description,
    sourceUrl: body.sourceUrl,
    servings: body.servings,
    prepTimeMinutes: body.prepTimeMinutes,
    cookTimeMinutes: body.cookTimeMinutes,
    totalTimeMinutes: body.totalTimeMinutes,
    ingredients: body.ingredients,
    steps: body.steps.map((s, i) => ({
      index: i,
      instruction: s.instruction,
      timerSeconds: s.timerSeconds
    })),
    tags: body.tags ?? [],
    createdAt: now,
    updatedAt: now
  };

  saveRecipe(recipe);
  res.status(201).json(recipe);
});

// List recipes
app.get("/recipes", (_req, res) => {
  res.json({ recipes: listRecipes() });
});

/* =========================
   Recipe Suggestions
   (must be BEFORE /recipes/:id)
========================= */

function normalizeName(s: string): string {
  return s.trim().toLowerCase();
}

app.get("/recipes/suggestions", (_req, res) => {
  const pantryHave = new Set(
    listPantryItems()
      .filter((p) => p.haveState === "have")
      .map((p) => normalizeName(p.name))
  );

  const suggestions = listRecipes().map((recipe) => {
    const ingNames = recipe.ingredients.map((i) =>
      normalizeName(i.name)
    );
    const total = Math.max(ingNames.length, 1);

    const missing = ingNames.filter((n) => !pantryHave.has(n));
    const haveCount = total - missing.length;
    const matchPercent = Math.round((haveCount / total) * 100);

    return {
      recipe,
      matchPercent,
      missingIngredients: missing
    };
  });

  suggestions.sort((a, b) => b.matchPercent - a.matchPercent);
  res.json({ suggestions });
});

/* =========================
   Recipe by ID
========================= */

app.get("/recipes/:id", (req, res) => {
  const recipe = getRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: "not found" });
  res.json(recipe);
});

app.put("/recipes/:id", (req, res) => {
  const existing = getRecipe(req.params.id);
  if (!existing) return res.status(404).json({ error: "not found" });

  const body = req.body as Partial<Recipe>;
  if (body.title !== undefined && !body.title) {
    return res.status(400).json({ error: "title cannot be empty" });
  }

  const now = new Date().toISOString();

  const updated: Recipe = {
    ...existing,
    ...body,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now
  };

  saveRecipe(updated);
  res.json(updated);
});

app.delete("/recipes/:id", (req, res) => {
  const ok = deleteRecipe(req.params.id);
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).send();
});

/* =========================
   Server
========================= */

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
