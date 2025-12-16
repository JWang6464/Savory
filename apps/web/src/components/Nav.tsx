import { Link, useLocation } from "react-router-dom";

export default function Nav() {
  const location = useLocation();

  const linkStyle = (path: string) => ({
    marginRight: 12,
    textDecoration: "none",
    fontWeight: location.pathname === path ? 700 : 400,
  });

  return (
    <div style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
      <Link to="/" style={linkStyle("/")}>
        Dashboard
      </Link>
      <Link to="/search" style={linkStyle("/search")}>
        Search
      </Link>
    </div>
  );
}
