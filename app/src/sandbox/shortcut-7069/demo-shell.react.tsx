import type { ReactNode } from "react";

export type DemoIconName =
  | "arrow-up-right"
  | "bolt"
  | "book"
  | "check"
  | "chevron-down"
  | "command"
  | "document"
  | "folder"
  | "grid"
  | "help"
  | "inbox"
  | "menu"
  | "search"
  | "settings"
  | "sparkles"
  | "users";

interface DemoIconProps {
  name: DemoIconName;
  size?: number;
}

export function DemoIcon({ name, size = 18 }: DemoIconProps) {
  const paths: Record<DemoIconName, ReactNode> = {
    "arrow-up-right": (
      <>
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </>
    ),
    bolt: <path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />,
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    "chevron-down": <path d="m6 9 6 6 6-6" />,
    command: (
      <>
        <path d="M9 6V5a3 3 0 1 0-3 3h1" />
        <path d="M15 6V5a3 3 0 1 1 3 3h-1" />
        <path d="M9 18v1a3 3 0 1 1-3-3h1" />
        <path d="M15 18v1a3 3 0 1 0 3-3h-1" />
        <rect width="8" height="8" x="8" y="8" rx="1" />
      </>
    ),
    document: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    folder: (
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Z" />
    ),
    grid: (
      <>
        <rect width="7" height="7" x="3" y="3" rx="2" />
        <rect width="7" height="7" x="14" y="3" rx="2" />
        <rect width="7" height="7" x="3" y="14" rx="2" />
        <rect width="7" height="7" x="14" y="14" rx="2" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.8 9a2.3 2.3 0 1 1 3.5 2c-.9.5-1.3 1-1.3 2" />
        <path d="M12 17h.01" />
      </>
    ),
    inbox: (
      <>
        <path d="M4 5h16v14H4z" />
        <path d="M4 13h4l2 3h4l2-3h4" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.1 3.3L16.5 8l-3.4 1.2L12 13l-1.2-3.8L7.5 8l3.3-1.7L12 3Z" />
        <path d="m18.5 14 .7 2.1 2.1.7-2.1.8-.7 2.1-.8-2.1-2.1-.8 2.1-.7.8-2.1Z" />
        <path d="m5.5 13 .6 1.7 1.7.6-1.7.7-.6 1.7-.7-1.7-1.7-.7 1.7-.6.7-1.7Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="demo-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {paths[name]}
      </g>
    </svg>
  );
}

interface DemoShellProps {
  active: "editor" | "settings";
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
  toolbar?: ReactNode;
}

export function DemoShell({
  active,
  children,
  description,
  eyebrow,
  title,
  toolbar,
}: DemoShellProps) {
  return (
    <div className="shortcut-demo">
      <a className="demo-skip-link" href="#shortcut-demo-content">
        Skip to content
      </a>
      <aside className="demo-sidebar" aria-label="Atlas navigation">
        <div className="demo-brand">
          <span className="demo-brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="demo-brand-copy">
            <strong>Atlas</strong>
            <span>Notes</span>
          </span>
        </div>

        <button className="demo-workspace" type="button">
          <span className="demo-workspace-avatar">OP</span>
          <span>
            <strong>Orbit Product</strong>
            <small>Team workspace</small>
          </span>
          <DemoIcon name="chevron-down" size={15} />
        </button>

        <nav className="demo-nav">
          <p className="demo-nav-label">Workspace</p>
          <button type="button">
            <DemoIcon name="grid" />
            Overview
          </button>
          <button type="button">
            <DemoIcon name="inbox" />
            Inbox
            <span className="demo-count">4</span>
          </button>
          <button
            aria-current={active === "editor" ? "page" : undefined}
            type="button"
          >
            <DemoIcon name="document" />
            Documents
          </button>
          <button type="button">
            <DemoIcon name="users" />
            Shared with me
          </button>

          <p className="demo-nav-label demo-nav-label--spaced">Library</p>
          <button type="button">
            <span className="demo-nav-dot demo-nav-dot--violet" />
            Product
          </button>
          <button type="button">
            <span className="demo-nav-dot demo-nav-dot--mint" />
            Research
          </button>
          <button type="button">
            <span className="demo-nav-dot demo-nav-dot--amber" />
            Personal
          </button>
        </nav>

        <div className="demo-sidebar-footer">
          <button
            aria-current={active === "settings" ? "page" : undefined}
            type="button"
          >
            <DemoIcon name="settings" />
            Settings
          </button>
          <button type="button">
            <DemoIcon name="help" />
            Help center
          </button>
          <div className="demo-profile">
            <span className="demo-profile-avatar">JD</span>
            <span>
              <strong>Jamie Duarte</strong>
              <small>jamie@atlas.team</small>
            </span>
            <span className="demo-online-dot" title="Online" />
          </div>
        </div>
      </aside>

      <div className="demo-stage">
        <header className="demo-topbar">
          <div className="demo-topbar-context">
            <button
              className="demo-mobile-menu"
              aria-label="Open menu"
              type="button"
            >
              <DemoIcon name="menu" />
            </button>
            <span className="demo-topbar-symbol">
              <DemoIcon name={active === "settings" ? "settings" : "book"} />
            </span>
            <span>{active === "settings" ? "Preferences" : "Product"}</span>
            <span aria-hidden="true">/</span>
            <strong>{title}</strong>
          </div>
          <div className="demo-topbar-actions">
            {toolbar}
            <button
              className="demo-icon-button"
              aria-label="Open search"
              type="button"
            >
              <DemoIcon name="search" />
            </button>
            <button
              className="demo-icon-button"
              aria-label="Open activity"
              type="button"
            >
              <DemoIcon name="bolt" />
            </button>
          </div>
        </header>

        <main className="demo-content" id="shortcut-demo-content">
          <header className="demo-page-heading">
            <div>
              <span className="demo-eyebrow">{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

interface DemoSwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function DemoSwitch({ checked, label, onChange }: DemoSwitchProps) {
  return (
    <label className="demo-switch">
      <span className="demo-switch-track">
        <input
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
          role="switch"
          type="checkbox"
        />
        <span className="demo-switch-thumb" />
      </span>
      <span>{label}</span>
    </label>
  );
}
