# Savory

Savory is a personal recipe vault and **pantry-aware cooking copilot**. It helps users store recipes, discover what they can cook with what they have, and cook step-by-step with contextual, AI-assisted guidance.

The core goal of Savory is to reduce friction while cooking: fewer tabs, fewer guesses, and better decisions mid-recipe.

---

## Key features

### Recipe & Pantry Management
- Create, edit, and delete recipes
- Structured ingredients and step-by-step instructions
- Pantry tracking with **have vs. missing** state
- Seeded starter recipes for instant demos

### Discovery & Planning
- Search recipes by keyword, tag, or max cook time
- Pantry-aware recipe suggestions with:
  - Match percentage
  - Missing ingredient breakdown

### Cook Mode
- Focused, step-by-step cooking view
- Keyboard navigation (← / →)
- Ingredient checklist with real-time have/missing status
- Designed for hands-on use while cooking

### AI Cooking Copilot
Savory includes a **context-aware cooking assistant** that lives directly inside Cook Mode.

The copilot:
- Answers questions about the **current step**
- Suggests substitutions based on **pantry contents**
- Provides timing, doneness, and food-safety guidance
- Responds in short, actionable advice suitable for live cooking

The backend dynamically builds a prompt using:
- Recipe title
- Ingredients
- Current step
- Pantry have/missing state
- User question

#### Demo-first design
To ensure the app works without paid API access:
- Savory falls back to a **deterministic demo copilot**
- The demo engine mimics real AI behavior using rule-based logic
- If API quota, billing, or auth fails, the UI continues to function seamlessly

This guarantees a stable experience for demos, recruiters, and local development.

---

## Tech stack

### Backend
- Express
- TypeScript
- OpenAI Responses API (optional / guarded)
- In-memory data store

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Architecture
- Shared domain types via workspace package (`@savory/shared`)
- Clear separation between UI, API, and domain logic
- Graceful degradation when external services are unavailable

---

## Monorepo structure

```
Savory/
  apps/
    api/        # Express + TypeScript backend
    web/        # React + Vite frontend
  packages/
    shared/     # Shared domain models (recipes, pantry, steps)
  docs/
    spec.md
```

---

## Local development

### 1) Start the API (Terminal 1)

From repo root:

```bash
cd apps/api
npm install
npm run dev
```

API runs at:

- http://localhost:3001

Key endpoints:
- GET /health
- GET /recipes
- GET /recipes/search
- GET /recipes/suggestions
- GET /pantry
- POST /ai/chat

> **Note:** Data is in-memory and resets on restart. Seed data is automatically loaded.

---

### 2) Start the web app (Terminal 2)

From repo root:

```bash
cd apps/web
npm install
npm run dev
```

Web runs at:

- http://localhost:5173

---

## AI setup (optional)

Savory works **without** an API key by default (demo mode).

To enable live AI responses:

1. Create an OpenAI API key
2. Add it to `apps/api/.env`:

```env
OPENAI_API_KEY=your_key_here
```

If the key is missing or quota is exceeded, the app automatically falls back to demo mode.

---

## Screenshots (recommended)

Suggested screenshots for portfolio:
- Dashboard (recipes + pantry + suggestions)
- Recipe list view
- Recipe detail page
- Cook Mode with AI copilot panel

---

## Design decisions

- **Demo-first AI:** prevents broken UX and avoids forcing paid setup
- **Cook-mode-centric UX:** optimized for real cooking, not browsing
- **Pantry-aware logic:** AI answers are grounded in user context
- **Shared domain types:** eliminates frontend/backend drift

---

## Future improvements

- Persistent storage (SQLite or Postgres)
- Recipe import from external URLs
- Ingredient normalization (pluralization, synonyms)
- Timers per step with notifications
- Save chat history per recipe
- Mobile-optimized Cook Mode
