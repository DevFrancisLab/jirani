import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const isMap = location.pathname.startsWith("/map");

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={navOpen}
        aria-controls="app-sidebar"
        onClick={() => setNavOpen((open) => !open)}
      >
        <span className="visually-hidden">
          {navOpen ? "Close navigation" : "Open navigation"}
        </span>
        <MenuGlyph />
      </button>
      <button
        type="button"
        className={navOpen ? "sidebar-backdrop is-open" : "sidebar-backdrop"}
        aria-hidden={!navOpen}
        tabIndex={navOpen ? 0 : -1}
        onClick={() => setNavOpen(false)}
      >
        <span className="visually-hidden">Close navigation</span>
      </button>
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      <main
        id="main-content"
        className={isMap ? "main is-flush" : "main"}
      >
        <Outlet />
      </main>
    </div>
  );
}

function MenuGlyph() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
      <path
        d="M1 1h16M1 7h16M1 13h16"
        stroke="#123C2A"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
