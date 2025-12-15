# Savory Product and Engineering Specification v1

## 1. Overview

Savory is a personal recipe vault built as a mobile first web app. It allows users to save recipes, search through them using pantry awareness, and receive guidance while cooking through a limited and intentional AI assistant.

The goal of Savory is to reduce friction during cooking, not just during recipe discovery.

Most cooking apps fail in three main ways:
- Recipes are scattered across different websites and are hard to organize
- Users often do not have exact ingredients and need substitutions
- Cooking instructions are static and do not help once cooking starts

Savory focuses on helping users actually complete a meal.

---

## 2. Target User

Savory is designed for:
- College students and young adults
- Casual home cooks
- People cooking in shared or constrained kitchens

Typical users:
- Save recipes from many websites
- Cook with limited ingredients or tools
- Want help while cooking, not just before starting

---

## 3. Core Product Principles

- Utility over novelty  
  Every feature should reduce friction during cooking

- Minimal UI during Cook Mode  
  The app should require as little thinking and interaction as possible

- AI is assistive, not the product  
  AI supports the cooking flow instead of replacing it

- Deterministic first, AI second  
  Rules and structure come before probabilistic behavior

- Graceful failure over fragile magic  
  When something fails, the user should still be able to continue

- Offline friendly  
  Cooking should not depend on a perfect connection

---

## 4. Feature Scope v1 App Store Ready

### 4.1 Recipe Vault

Users can:
- Save recipes manually
- Import recipes from a URL using a best effort approach

Each recipe stores:
- Title
- Ingredients
- Ordered steps
- Time information when available
- Servings
- Tags such as cuisine or difficulty
- Source link

Import strategy:
1. Primary method uses schema.org Recipe JSON LD
2. Fallback uses readability based extraction and heuristics
3. Low confidence imports require manual review before saving

Recipes are never auto saved without user confirmation.

---

### 4.2 Pantry System Lightweight

The pantry system is intentionally simple.

Each pantry item includes:
- Ingredient name
- Optional quantity
- Optional expiration date
- Binary state indicating whether the user has it

Purpose:
- Enable pantry based recipe ranking
- Enable substitution suggestions

Quantities are not enforced in v1 to avoid overengineering.

---

### 4.3 Recipe Search and Discovery

Search supports:
- Full text search
- Filters for time, tags, difficulty, and pantry match score

Pantry match score:
- Percentage of ingredients the user has
- Missing ingredients are displayed clearly
- Ranking is deterministic and explainable

---

### 4.4 Cook Mode Primary UX Surface

Cook Mode is the core experience of Savory.

Features:
- One step at a time
- Large text and minimal UI
- Tap to advance steps
- Built in timers
- Ability to jump to any step
- Cached for offline use
- Screen stays awake during cooking

Design goal:
Zero thinking required while cooking.

---

## 5. AI Integration Intentional and Limited

### 5.1 Ingredient Substitutions v1

Trigger:
- User taps a missing ingredient

Behavior:
- Suggests two to three substitutes
- Explains why each substitute works
- Respects cuisine and dietary constraints
- Labels confidence level such as best, acceptable, or last resort

This is the highest value AI feature in v1.

---

### 5.2 Cook Mode Assistant

The assistant is strictly context bound.

Capabilities:
- Explain cooking terms
- Adapt steps to constraints like no oven or wrong pan
- Help troubleshoot mistakes such as food being too salty or too thick

Constraints:
- Answers are based only on the current recipe
- No hallucinated steps
- No general chat
- Does not modify quantities unless explicitly requested

---

### 5.3 Pantry to Recipe Suggestions v1.5

- Suggests recipes based on pantry contents
- Recommends minimal modifications
- Starts rule based and may evolve later

---

## 6. Features Explicitly Excluded v1

The following features are intentionally excluded to protect focus:
- Social features
- Nutrition tracking
- Voice assistants
- Camera based ingredient recognition
- Meal planning calendars
- Public recipe sharing

---

## 7. UX and App Store Readiness Criteria

- App opens to a usable state in fewer than three taps
- Cook Mode works offline
- Clear empty states
- No clutter during cooking
- Fast load times
- No crashes during Cook Mode
- Usable with one hand

---

## 8. Technical Architecture High Level

Frontend:
- Mobile first web app
- Offline caching
- Cook Mode optimized layout

Backend:
- REST API
- Authentication and authorization
- Recipe import pipeline
- Search and ranking
- Background jobs for imports

Data:
- Normalized ingredients
- Ordered instruction steps
- Pantry items linked to ingredients

AI:
- Feature flagged
- Strict JSON schema enforcement
- Confidence scoring and explainable outputs

---

## 9. Legal and Ethical Considerations

- Import only ingredients, instructions, and metadata
- Always store and display the source link
- No article cloning
- Respect robots.txt and rate limits
- Identify user agent when fetching URLs

---

## 10. Success Criteria

Product success:
- A user can cook a full meal end to end using Savory
- AI helps without blocking or confusing the user

Engineering success:
- Clean APIs
- Clear data models
- Graceful failure handling
- Repository documentation that explains design decisions

---

## 11. Future Expansion Post v1

- Shopping list export
- Personal taste learning
- Recipe scaling
- Optional nutrition layer

---

## 12. GPT Project Usage Support Tool Only

A GPT Project may be used to:
- Design and test prompt templates
- Define AI guardrails
- Iterate on assistant behavior
- Store example interactions

It is not:
- The backend
- The product
- Where the app lives

All finalized logic is implemented in code.

---

## 13. Development Plan

1. Lock v1 scope
2. Define data schemas
3. Build backend first
4. Implement Cook Mode
5. Add AI features last
