# Savory

Savory is a personal recipe vault and pantry-aware cooking copilot. It helps you store recipes, search by keyword/tag/time, and cook step-by-step with pantry-based “have vs missing” ingredient matching.

## Key features

* Recipe vault (create, edit, delete recipes)
* Search recipes by keyword, tag, and max time
* Pantry management
* Pantry-aware recipe suggestions (match percent + missing ingredients)
* Cook Mode: step-by-step view with keyboard navigation
* Recipe Detail page that bridges browsing and Cook Mode
* Shared TypeScript domain model across backend and frontend (`@savory/shared`)
* Seeded starter recipes on API startup for fast demos

## Tech stack

* Backend: Express + TypeScript (in-memory store)
* Frontend: React + TypeScript + Vite
* Routing: React Router
* Shared types: TypeScript workspace package (`@savory/shared`)

## Monorepo structure

```
Savory/
  apps/
    api/        # Express + TypeScript backend
    web/        # React + Vite frontend
  packages/
    shared/     # shared domain types
  docs/
    spec.md
```

## Local development

### 1) Start the API (Terminal 1)

From repo root:

```bash
cd apps/api
npm install
npm run dev
```

API runs at:

* [http://localhost:3001](http://localhost:3001)

Useful endpoints:

* GET /health
* GET /recipes
* GET /recipes/search?q=&tag=&maxTimeMinutes=
* GET /recipes/suggestions
* GET /pantry

### 2) Start the web app (Terminal 2)

From repo root:

```bash
cd apps/web
npm install
npm run dev
```

Web runs at:

* [http://localhost:5173](http://localhost:5173)

## Screenshots

Add screenshots here (recommended for portfolio):

* Dashboard (recipes + pantry + suggestions)
* Search (filters + results)
* Recipe Detail
* Cook Mode (with have/missing)

## Notes

* Data is currently in-memory, so it resets when the API restarts.
* The API seeds a few sample recipes on startup to make demos immediate.

## Future improvements

* Persistent storage (SQLite or JSON file)
* “Import from URL” to parse recipes from websites
* Better ingredient matching (pluralization, synonyms, fuzzy match)
* Sorting and filtering UX polish (tag chips, sort by time, etc.)
