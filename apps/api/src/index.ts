import express from "express";
import cors from "cors";
import crypto from "crypto";
import { Recipe } from "../../../packages/shared/types";
import { saveRecipe, listRecipes } from "./store";
import { getRecipe, deleteRecipe } from "./store";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});


// Get recipe by id
app.get("/recipes/:id", (req, res) => {
  const recipe = getRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: "not found" });
  res.json(recipe);
});

// Update recipe by id
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

// Delete recipe by id
app.delete("/recipes/:id", (req, res) => {
  const ok = deleteRecipe(req.params.id);
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).send();
});
