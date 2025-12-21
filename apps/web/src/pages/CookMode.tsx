import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { chatAI, fetchPantry, fetchRecipeById } from "../api";
import type { PantryItem, Recipe } from "@savory/shared";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function CookMode() {
  const { id } = useParams<{ id: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me anything about this recipe: substitutions, timing, techniques, or what to do next.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const steps = useMemo(() => recipe?.steps ?? [], [recipe]);
  const ingredients = useMemo(() => recipe?.ingredients ?? [], [recipe]);

  const pantryHaveSet = useMemo(() => {
    const set = new Set<string>();
    for (const item of pantry) {
      if (item.haveState === "have") set.add(normalizeName(item.name));
    }
    return set;
  }, [pantry]);

  const ingredientStatus = useMemo(() => {
    return ingredients.map((ing) => {
      const name = ing.name ?? "";
      const have = pantryHaveSet.has(normalizeName(name));
      return { name, have };
    });
  }, [ingredients, pantryHaveSet]);

  const pantryHaveNames = useMemo(
    () =>
      pantry
        .filter((p) => p.haveState === "have")
        .map((p) => p.name)
        .filter(Boolean),
    [pantry]
  );

  const pantryMissingNames = useMemo(
    () => ingredientStatus.filter((x) => !x.have).map((x) => x.name).filter(Boolean),
    [ingredientStatus]
  );

  const currentStep =
    steps.length > 0 && stepIndex >= 0 && stepIndex < steps.length
      ? steps[stepIndex]
      : null;

  useEffect(() => {
    async function load() {
      if (!id) {
        setError("Missing recipe id in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [r, p] = await Promise.all([fetchRecipeById(id), fetchPantry()]);
        setRecipe(r);
        setPantry(p);
        setStepIndex(0);

        // Reset chat state when switching recipes
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content:
              "Ask me anything about this recipe: substitutions, timing, techniques, or what to do next.",
          },
        ]);
        setChatError(null);
        setChatInput("");
      } catch (e: any) {
        setError(e?.message ?? "Failed to load Cook Mode.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  function goPrev() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function goNext() {
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (loading || error) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, error, steps.length]);

  const title = recipe?.title ?? "Recipe";

  const haveCount = ingredientStatus.filter((x) => x.have).length;
  const missingCount = ingredientStatus.length - haveCount;

  // scroll chat to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage() {
    if (isSending) return;
    const question = chatInput.trim();
    if (!question) return;
    if (!recipe) return;

    setChatError(null);
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      const resp = await chatAI({
        question,
        recipeTitle: recipe.title,
        ingredients: recipe.ingredients.map((i) => i.name).filter(Boolean),
        currentStep: currentStep?.instruction ?? "",
        pantryHave: pantryHaveNames,
        pantryMissing: pantryMissingNames,
      });

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: resp.message,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e: any) {
      setChatError(e?.message ?? "Failed to contact AI.");
    } finally {
      setIsSending(false);
    }
  }

  // Light-theme primitives
  const buttonPrimary =
    "inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50";
  const buttonNeutral =
    "inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50";
  const inputBase =
    "w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-black/20 focus:ring-2 focus:ring-black/5";

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
        <Link to="/" className="hover:text-zinc-900">
          Dashboard
        </Link>
        <span className="text-black/20">/</span>
        <Link to="/recipes" className="hover:text-zinc-900">
          Recipes
        </Link>
        <span className="text-black/20">/</span>
        <span className="text-zinc-900">Cook Mode</span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Cook Mode
        </h1>
        <p className="mt-1 text-sm text-zinc-600">{title}</p>
      </div>

      {loading ? <p className="text-sm text-zinc-600">Loading...</p> : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <span className="font-semibold">Error:</span> {error}
        </div>
      ) : null}

      {!loading && !error && recipe ? (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          {/* Left: Cook Mode */}
          <div className="space-y-6">
            <Card title={`Ingredients (${haveCount} have, ${missingCount} missing)`}>
              {ingredientStatus.length === 0 ? (
                <div className="text-sm text-zinc-600">No ingredients listed.</div>
              ) : (
                <ul className="space-y-2">
                  {ingredientStatus.map((ing, idx) => (
                    <li
                      key={`${ing.name}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-2 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-zinc-900">
                          {ing.name}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          ing.have
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {ing.have ? "Have" : "Missing"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title={`Step ${steps.length === 0 ? 0 : stepIndex + 1} of ${steps.length}`}
              right={
                <span className="text-xs text-zinc-600">Use ← and → arrow keys</span>
              }
            >
              <div className="space-y-4">
                <div className="text-lg leading-relaxed text-zinc-900">
                  {currentStep?.instruction ?? "No steps found for this recipe."}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={goPrev}
                    disabled={stepIndex === 0}
                    className={buttonNeutral}
                  >
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    disabled={steps.length === 0 || stepIndex >= steps.length - 1}
                    className={buttonPrimary}
                  >
                    Next
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: AI Chat Panel */}
          <div className="sticky top-[88px] h-[calc(100vh-120px)]">
            <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-sm backdrop-blur">
              <div className="border-b border-black/10 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Cooking Copilot
                    </div>
                    <div className="text-xs text-zinc-600">
                      Ask questions about this step or substitutions.
                    </div>
                  </div>
                  <div className="rounded-full border border-black/10 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
                    Step {steps.length === 0 ? 0 : stepIndex + 1}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto px-5 py-4">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-50 text-zinc-800 border border-black/10"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {chatError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      <span className="font-semibold">AI error:</span> {chatError}
                    </div>
                  ) : null}

                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="border-t border-black/10 p-4">
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ask: what can I substitute for mirin?"
                    className={inputBase}
                    disabled={isSending}
                  />
                  <button
                    onClick={sendMessage}
                    className={buttonPrimary}
                    disabled={isSending || !chatInput.trim()}
                  >
                    {isSending ? "..." : "Send"}
                  </button>
                </div>

                <div className="mt-2 text-xs text-zinc-500">
                  Tip: Include what you have (from pantry) and what step you’re on.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
