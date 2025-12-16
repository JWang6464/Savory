import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Search from "./pages/Search";
import CookMode from "./pages/CookMode";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: 12 }}>
          Dashboard
        </Link>
        <Link to="/search">Search</Link>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/recipes/:id" element={<CookMode />} />
      </Routes>
    </BrowserRouter>
  );
}
