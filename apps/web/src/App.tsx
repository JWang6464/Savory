import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import CookMode from "./pages/CookMode";
import RecipeDetail from "./pages/RecipeDetail";
import RecipesPage from "./pages/Recipes";
import Nav from "./components/Nav";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f4ef] text-zinc-900">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-[-20%] top-[-30%] h-[520px] w-[520px] rounded-full bg-orange-200/50 blur-3xl" />
          <div className="absolute right-[-15%] top-[10%] h-[520px] w-[520px] rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute bottom-[-35%] left-[15%] h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <Nav />

        <main className="mx-auto max-w-6xl px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/search" element={<Search />} />

            {/* Recipe pages */}
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/recipes/:id/cook" element={<CookMode />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
