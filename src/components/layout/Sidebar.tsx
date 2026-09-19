import { NavLink } from "react-router-dom";

const links = [
  { to: "/overview", label: "Overview", icon: OverviewIcon },
  { to: "/developments", label: "Developments", icon: DevelopmentsIcon },
  { to: "/concerns", label: "Community Concerns", icon: ConcernsIcon },
  { to: "/map", label: "Community Map", icon: MapIcon },
  { to: "/insights", label: "Insights", icon: InsightsIcon },
  { to: "/reports", label: "Reports", icon: ReportsIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  return (
    <aside className={open ? "sidebar is-open" : "sidebar"} id="app-sidebar">
      <NavLink to="/overview" className="sidebar__brand" onClick={onNavigate}>
        <BrandMark />
        <span className="sidebar__copy">
          <span className="sidebar__product">Jirani</span>
          <span className="sidebar__org">Team Urbana</span>
        </span>
      </NavLink>
      <nav className="sidebar__nav" aria-label="Dashboard">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "sidebar__link is-active" : "sidebar__link"
            }
            onClick={onNavigate}
          >
            <link.icon />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <p className="sidebar__footer">
        Kilimani, Nairobi
        <br />
        Turning community voices into planning evidence.
      </p>
    </aside>
  );
}

function BrandMark() {
  return (
    <svg
      className="sidebar__mark"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="4" fill="#F7F5EF" />
      <path
        d="M16 7.2c3.4 0 6.1 2.6 6.1 5.9 0 4.4-6.1 11.7-6.1 11.7S9.9 17.5 9.9 13.1c0-3.3 2.7-5.9 6.1-5.9Z"
        fill="#123C2A"
      />
      <circle cx="16" cy="13.1" r="2.1" fill="#E8B04A" />
    </svg>
  );
}

function OverviewIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function DevelopmentsIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20V9l6-4 6 4v11M10 20v-6h4v6M20 20V11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ConcernsIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 6h14M5 12h10M5 18h7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="11" r="1.8" fill="currentColor" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 17V13M10 17V8M15 17v-5M20 17V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.8h7.2L19 8.5V20.2H7V3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3.8V8.6h4.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.5 6.5l1.6 1.6M15.9 15.9l1.6 1.6M17.5 6.5l-1.6 1.6M8.1 15.9l-1.6 1.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
