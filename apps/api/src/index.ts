import "dotenv/config";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import OpenAI from "openai";

import { Recipe, PantryItem } from "../../../packages/shared/types";
import {
  saveRecipe,
  listRecipes,
  getRecipe,
  deleteRecipe,
  savePantryItem,
  listPantryItems,
  deletePantryItem,
} from "./store";
import { filterRecipes } from "./search";
import { seedIfEmpty } from "./seed";

const app = express();
app.use(cors());
app.use(express.json());

seedIfEmpty();

/* =========================
   OpenAI Client
========================= */

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   Health
========================= */

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* =========================
   AI Chat (Cook Copilot)
========================= */

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type AiChatBody = {
  messages: ChatMessage[];
  context?: {
    recipeTitle?: string;
    ingredients?: string[];
    currentStep?: string;
    pantryHave?: string[];
    pantryMissing?: string[];
  };
};

function demoCookCopilotAnswer(params: {
  question: string;
  recipeTitle: string;
  ingredients: string[];
  currentStep: string;
  pantryHave: string[];
  pantryMissing: string[];
}): string {
  const q = params.question.toLowerCase();

  // Very lightweight, deterministic “AI-like” help (portfolio-safe)
  const tips: string[] = [];

  // Substitution-oriented answers
  if (q.includes("substitute") || q.includes("replace") || q.includes("instead")) {
    tips.push("Substitution idea (demo mode):");

    if (q.includes("oyster")) {
      tips.push("- If you have soy sauce: use soy sauce + a small pinch of sugar/honey to mimic sweetness.");
      tips.push("- If you have hoisin: use a smaller amount (it’s sweeter/thicker).");
      tips.push("- If you have Worcestershire: add a few drops for savory depth.");
    } else {
      tips.push("- Tell me what ingredient you’re missing, and what you *do* have, and I’ll suggest the closest swap.");
    }

    tips.push("- Start with half the amount, taste, then adjust.");
  }

  // Timing / doneness
  if (q.includes("done") || q.includes("safe") || q.includes("cook") || q.includes("temperature")) {
    tips.push("Food safety (demo mode):");
    tips.push("- For poultry: aim for 165°F / 74°C internal temp.");
    tips.push("- For ground meats: 160°F / 71°C (beef/pork), poultry still 165°F.");
    tips.push("- If you don’t have a thermometer: look for clear juices and no pink in the center (less reliable).");
  }

  // Step guidance
  if (q.includes("step") || q.includes("what do i do") || q.includes("next")) {
    tips.push("Step guidance (demo mode):");
    if (params.currentStep) {
      tips.push(`- Current step: ${params.currentStep}`);
      tips.push("- If something looks off, tell me what you see/smell/texture and I’ll troubleshoot.");
    } else {
      tips.push("- Tell me which step you’re on and what feels unclear.");
    }
  }

  // Pantry-aware nudge
  if (params.pantryMissing.length > 0) {
    tips.push("Pantry check (demo mode):");
    tips.push(`- Missing: ${params.pantryMissing.slice(0, 6).join(", ")}${params.pantryMissing.length > 6 ? "..." : ""}`);
    tips.push(`- Have: ${params.pantryHave.slice(0, 6).join(", ")}${params.pantryHave.length > 6 ? "..." : ""}`);
  }

  // If nothing triggered, provide a helpful generic reply
  if (tips.length === 0) {
    tips.push("Demo mode response:");
    tips.push("- Tell me what ingredient/tool you’re missing, what step you’re on, and what you have in your pantry.");
    tips.push("- I can suggest substitutions, timing adjustments, and troubleshooting checks.");
  }

  // Context footer (subtle, portfolio-friendly)
  tips.push("");
  tips.push(`(Recipe: ${params.recipeTitle})`);

  return tips.join("\n");
}

app.post("/ai/chat", async (req, res) => {
  try {
    const body = req.body as Partial<AiChatBody>;
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return res.status(400).json({ error: "messages is required" });
    }

    for (const m of messages) {
      if (m.role !== "user" && m.role !== "assistant") {
        return res.status(400).json({ error: "Invalid message role" });
      }
      if (typeof m.content !== "string" || m.content.trim() === "") {
        return res.status(400).json({ error: "Invalid message content" });
      }
    }

    const ctx = body.context ?? {};
    const recipeTitle = ctx.recipeTitle ?? "Unknown recipe";
    const ingredients = Array.isArray(ctx.ingredients) ? ctx.ingredients : [];
    const currentStep = ctx.currentStep ?? "";
    const pantryHave = Array.isArray(ctx.pantryHave) ? ctx.pantryHave : [];
    const pantryMissing = Array.isArray(ctx.pantryMissing) ? ctx.pantryMissing : [];

    // Find the last user question
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const question = lastUser?.content?.trim() ?? "";

    if (!question) {
      return res.status(400).json({ error: "Last user message is required" });
    }

    const systemInstruction = `
You are Savory, a calm, practical cooking copilot.

Goals:
- Help the user successfully cook the recipe step-by-step.
- Answer questions clearly and safely.
- Offer substitutions when ingredients are missing, using the pantry context.
- Keep responses concise and actionable (bullets are fine).

Safety:
- If user asks about raw meat safety, doneness, food storage, allergies, or cross-contamination: be conservative and recommend safe practices.
- If you are unsure, say so and suggest a safe option.

Context:
Recipe: ${recipeTitle}
Ingredients: ${ingredients.length ? ingredients.join(", ") : "(none provided)"}
Current step: ${currentStep || "(not in cook mode step yet)"}
Pantry have: ${pantryHave.length ? pantryHave.join(", ") : "(unknown)"}
Pantry missing: ${pantryMissing.length ? pantryMissing.join(", ") : "(unknown)"}
`.trim();

    // If the key is missing, immediately fall back (demo mode)
    if (!process.env.OPENAI_API_KEY) {
      const demo = demoCookCopilotAnswer({
        question,
        recipeTitle,
        ingredients,
        currentStep,
        pantryHave,
        pantryMissing,
      });

      return res.json({ message: demo, mode: "demo" });
    }

    const input = [
      { role: "system" as const, content: systemInstruction },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    try {
      const response = await client.responses.create({
        model: "gpt-5-mini",
        input,
        store: false,
      });

      return res.json({
        message: response.output_text ?? "",
        mode: "live",
      });
    } catch (err: any) {
      // If quota/billing/authorization fails, fall back to demo mode
      const msg = String(err?.message ?? "");
      const isQuotaOrBilling =
        msg.includes("429") ||
        msg.toLowerCase().includes("quota") ||
        msg.toLowerCase().includes("billing") ||
        msg.toLowerCase().includes("insufficient") ||
        msg.toLowerCase().includes("rate limit");

      if (isQuotaOrBilling) {
        const demo = demoCookCopilotAnswer({
          question,
          recipeTitle,
          ingredients,
          currentStep,
          pantryHave,
          pantryMissing,
        });

        return res.json({ message: demo, mode: "demo" });
      }

      throw err;
    }
  } catch (err: any) {
    console.error("AI chat error:", err);
    return res.status(500).json({
      error: "AI chat failed",
      detail: err?.message ?? String(err),
    });
  }
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
    updatedAt: now,
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
      timerSeconds: s.timerSeconds,
    })),
    tags: body.tags ?? [],
    createdAt: now,
    updatedAt: now,
  };

  saveRecipe(recipe);
  res.status(201).json(recipe);
});

// List recipes
app.get("/recipes", (_req, res) => {
  res.json({ recipes: listRecipes() });
});

/* =========================
   Recipe Search
   (must be BEFORE /recipes/:id)
========================= */

app.get("/recipes/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag : undefined;

  const maxTimeMinutes =
    typeof req.query.maxTimeMinutes === "string"
      ? Number(req.query.maxTimeMinutes)
      : undefined;

  if (maxTimeMinutes !== undefined && Number.isNaN(maxTimeMinutes)) {
    return res.status(400).json({ error: "maxTimeMinutes must be a number" });
  }

  const results = filterRecipes(listRecipes(), {
    q,
    tag,
    maxTimeMinutes,
  });

  res.json({ recipes: results });
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
    const ingNames = recipe.ingredients.map((i) => normalizeName(i.name));
    const total = Math.max(ingNames.length, 1);

    const missing = ingNames.filter((n) => !pantryHave.has(n));
    const haveCount = total - missing.length;
    const matchPercent = Math.round((haveCount / total) * 100);

    return {
      recipe,
      matchPercent,
      missingIngredients: missing,
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
    updatedAt: now,
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
