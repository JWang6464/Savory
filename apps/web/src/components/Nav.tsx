import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-lg font-semibold tracking-wide">
          <Link to="/" className="hover:text-white">
            Savory
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/"
            className={`transition ${
              isActive("/")
                ? "text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/search"
            className={`transition ${
              isActive("/search")
                ? "text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Search
          </Link>
        </div>
      </nav>
    </header>
  );
}
