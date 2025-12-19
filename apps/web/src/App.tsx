import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import CookMode from "./pages/CookMode";
import RecipeDetail from "./pages/RecipeDetail";
import Nav from "./components/Nav";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-zinc-100">
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/recipes/:id" element={<CookMode />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
