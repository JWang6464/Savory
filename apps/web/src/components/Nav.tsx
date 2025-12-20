import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    isActive(path)
      ? "font-medium text-zinc-900"
      : "text-zinc-500 hover:text-zinc-800";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-zinc-900"
        >
          Savory
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className={linkClass("/")}>
            Dashboard
          </Link>

          <Link to="/recipes" className={linkClass("/recipes")}>
            Recipes
          </Link>

          <Link to="/search" className={linkClass("/search")}>
            Search
          </Link>
        </div>
      </nav>
    </header>
  );
}
