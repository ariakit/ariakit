import { createShortcutStore } from "@ariakit/components/shortcut/shortcut-store";
import {
  Shortcut,
  ShortcutCommand,
  ShortcutProvider,
  ShortcutScope,
} from "@ariakit/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import "./style.css";

const previewShortcut = createShortcutStore();
// The core command outlives React renders; mounted previews subscribe only to
// mirror its user-visible result into their own interface.
const refreshSubscribers = new Set<(source: string) => void>();

const unregisterRefreshPreview = previewShortcut.registerCommand({
  command: "refresh-preview",
  enabledInTextbox: false,
  keys: "mod+Shift+P",
  onTrigger(event) {
    for (const subscriber of refreshSubscribers) {
      subscriber(event.source);
    }
  },
  preventDefault: true,
});

// Release the retained document listener before the replacement module
// registers this command again.
import.meta.hot?.dispose(unregisterRefreshPreview);

const subscribeToClient = () => () => {};

// A portal in an iframe does not inherit the parent document's stylesheet.
const frameStyles = `
  :root {
    color-scheme: light;
    font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f4ef; color: #22253a; }
  button, input { font: inherit; }
  button { color: inherit; }
  .frame-app {
    min-height: 100vh;
    padding: 18px;
    background:
      radial-gradient(circle at 82% 5%, rgb(248 188 145 / 28%), transparent 13rem),
      linear-gradient(160deg, #faf8f3, #f2efe9);
  }
  .frame-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .frame-dots { display: flex; gap: 5px; }
  .frame-dots span { width: 7px; height: 7px; border-radius: 50%; background: #d3cec5; }
  .frame-dots span:first-child { background: #f09e7a; }
  .frame-dots span:nth-child(2) { background: #e4c16e; }
  .frame-dots span:last-child { background: #72c59a; }
  .frame-connection {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #66636d;
    font-size: 9px;
    font-weight: 700;
  }
  .frame-connection::before {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #b8b5b0;
    content: "";
  }
  .frame-connection[data-attached]::before {
    background: #35a674;
    box-shadow: 0 0 0 3px rgb(53 166 116 / 12%);
  }
  .frame-card {
    overflow: hidden;
    border: 1px solid #e3ded4;
    border-radius: 18px;
    background: rgb(255 255 255 / 88%);
    box-shadow: 0 18px 48px rgb(76 66 51 / 10%);
  }
  .frame-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid #ece7df;
  }
  .frame-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 10px;
    font-weight: 850;
  }
  .frame-logo span {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border-radius: 8px;
    color: #fff;
    background: #e16e45;
  }
  .frame-nav-links { display: flex; gap: 14px; color: #706d78; font-size: 8px; }
  .frame-hero {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(150px, .9fr);
    gap: 20px;
    min-height: 265px;
    align-items: center;
    padding: 28px;
  }
  .frame-kicker {
    margin: 0 0 7px;
    color: #b84f2f;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: .13em;
    text-transform: uppercase;
  }
  .frame-hero h2 {
    max-width: 340px;
    margin: 0;
    font-family: Georgia, serif;
    font-size: clamp(29px, 4.2vw, 47px);
    font-weight: 500;
    letter-spacing: -.045em;
    line-height: .98;
  }
  .frame-copy {
    max-width: 330px;
    margin: 13px 0 18px;
    color: #77737b;
    font-size: 10px;
    line-height: 1.55;
  }
  .frame-actions { display: flex; align-items: center; gap: 9px; }
  .frame-button {
    min-height: 35px;
    padding: 0 13px;
    border: 0;
    border-radius: 9px;
    outline: none;
    color: #fff;
    background: #272b42;
    box-shadow: 0 8px 18px rgb(39 43 66 / 18%);
    cursor: pointer;
    font-size: 9px;
    font-weight: 800;
  }
  .frame-button:focus-visible,
  .frame-title:focus-visible {
    outline: 3px solid #d85f38;
    outline-offset: 2px;
  }
  .frame-revision { color: #6b6870; font-size: 8px; font-weight: 700; }
  .frame-art {
    position: relative;
    min-height: 205px;
    border-radius: 80px 80px 18px 18px;
    background:
      radial-gradient(circle at 54% 35%, #f8cf9d 0 17%, transparent 18%),
      radial-gradient(circle at 45% 84%, #c7d2a5 0 19%, transparent 20%),
      linear-gradient(145deg, #f0a984, #e77a62 54%, #c95051);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 25%);
  }
  .frame-art::before,
  .frame-art::after {
    position: absolute;
    border-radius: 999px;
    background: rgb(255 255 255 / 35%);
    content: "";
  }
  .frame-art::before { width: 72px; height: 20px; right: 19px; top: 30px; transform: rotate(-24deg); }
  .frame-art::after { width: 96px; height: 26px; left: 21px; bottom: 29px; transform: rotate(19deg); }
  .frame-fields {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #ece7df;
    background: #fbfaf7;
  }
  .frame-field { display: grid; gap: 5px; color: #77747c; font-size: 8px; font-weight: 750; }
  .frame-title {
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border: 1px solid #dfdad2;
    border-radius: 8px;
    outline: none;
    color: #303246;
    background: #fff;
    font-size: 10px;
  }
  .frame-shortcut {
    align-self: end;
    display: flex;
    min-height: 34px;
    align-items: center;
    gap: 7px;
    padding: 0 10px;
    border: 1px solid #e2ddd5;
    border-radius: 8px;
    color: #76727a;
    background: #fff;
    font-size: 8px;
    font-weight: 700;
  }
  .frame-shortcut kbd {
    color: #5e526c;
    font-family: inherit;
    font-weight: 850;
  }
  @media (max-width: 560px) {
    .frame-hero { grid-template-columns: 1fr; padding: 22px; }
    .frame-art { min-height: 150px; }
  }
`;

const shadowStyles = `
  :host {
    color-scheme: dark;
    font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  .shadow-card {
    display: grid;
    gap: 12px;
    padding: 14px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 15px;
    color: #e9e5f4;
    background:
      radial-gradient(circle at 100% 0, rgb(160 126 235 / 23%), transparent 8rem),
      #282338;
    box-shadow: 0 16px 36px rgb(5 4 10 / 18%);
  }
  .shadow-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .shadow-heading p {
    margin: 0 0 3px;
    color: #9991ab;
    font-size: 7px;
    font-weight: 850;
    letter-spacing: .13em;
    text-transform: uppercase;
  }
  .shadow-heading h2 { margin: 0; font-size: 12px; letter-spacing: -.02em; }
  .shadow-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 7px;
    border-radius: 999px;
    color: #7fd2ae;
    background: rgb(88 192 147 / 10%);
    font-size: 7px;
    font-weight: 800;
  }
  .shadow-badge::before {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #68c89f;
    content: "";
  }
  .shadow-command {
    display: flex;
    min-height: 36px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 7px 6px 10px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 9px;
    outline: none;
    color: #eeeaf7;
    background: rgb(255 255 255 / 6%);
    cursor: pointer;
    font: inherit;
    font-size: 8px;
    font-weight: 800;
  }
  .shadow-command:hover { background: rgb(255 255 255 / 9%); }
  .shadow-command:focus-visible,
  .shadow-input:focus-visible {
    outline: 3px solid #a684f3;
    outline-offset: 2px;
  }
  .shadow-command > kbd {
    color: #b9a7e5;
    font-family: inherit;
    font-size: 7px;
    white-space: nowrap;
  }
  .shadow-command [data-key] {
    display: inline-flex;
    min-width: 19px;
    justify-content: center;
    margin: 0 1px;
    padding: 4px 6px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 5px;
    background: rgb(8 7 14 / 20%);
  }
  .shadow-field {
    display: grid;
    gap: 5px;
    color: #aaa3ba;
    font-size: 7px;
    font-weight: 750;
  }
  .shadow-input {
    width: 100%;
    height: 33px;
    padding: 0 9px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 8px;
    outline: none;
    color: #eeeaf6;
    background: rgb(12 10 21 / 25%);
    font: inherit;
    font-size: 8px;
  }
  .shadow-input::placeholder { color: #aaa3ba; }
  .shadow-safety { color: #aaa3ba; font-size: 7px; line-height: 1.45; }
  .shadow-slot-lab {
    display: grid;
    gap: 8px;
    padding: 9px;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 10px;
    background: rgb(8 7 14 / 16%);
  }
  .shadow-slot-heading,
  .shadow-slot-results {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .shadow-slot-heading strong { font-size: 8px; }
  .shadow-slot-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #bdb5cd;
    font-size: 7px;
    font-weight: 750;
  }
  .shadow-slot-toggle input { width: 10px; height: 10px; margin: 0; }
  [data-slot-host] { display: block; }
  .shadow-slot-action {
    display: flex;
    width: 100%;
    min-height: 28px;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 7px;
    border: 1px solid rgb(255 255 255 / 9%);
    border-radius: 7px;
    outline: none;
    color: #ddd7ec;
    background: rgb(255 255 255 / 5%);
    cursor: pointer;
    font: inherit;
    font-size: 7px;
    font-weight: 750;
  }
  .shadow-slot-action:focus-visible {
    outline: 3px solid #a684f3;
    outline-offset: 2px;
  }
  .shadow-slot-action kbd {
    color: #b9a7e5;
    font: inherit;
    font-weight: 850;
  }
  .shadow-slot-results {
    color: #aaa3ba;
    font-size: 6px;
    font-weight: 700;
  }
`;

const slotStyles = `
  :host { display: block; }
  * { box-sizing: border-box; }
  .slot-boundaries { display: grid; gap: 5px; }
  .slot-boundary {
    min-width: 0;
    padding: 3px;
    border-radius: 8px;
  }
  .slot-boundary[inert] { opacity: .48; }
`;

function Icon({ name }: { name: "bolt" | "refresh" | "send" }) {
  const paths = {
    bolt: <path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z" />,
    refresh: (
      <path d="M20 7v5h-5M4 17v-5h5m9.5-3A7.5 7.5 0 0 0 6 6.5L4 9m16 6-2 2.5A7.5 7.5 0 0 1 5.5 15" />
    ),
    send: <path d="m21 3-7.5 18-3.2-7.3L3 10.5 21 3Zm-10.7 10.7L21 3" />,
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

interface PreviewCanvasProps {
  attached: boolean;
  refreshes: number;
}

function SlottedBoundary() {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [scopeWrapper, setScopeWrapper] = useState<HTMLDivElement | null>(null);
  const [referenceInert, setReferenceInert] = useState(false);
  const [referenceActivations, setReferenceActivations] = useState(0);
  const [scopeActivations, setScopeActivations] = useState(0);

  const setHost = useCallback((element: HTMLDivElement | null) => {
    setShadowRoot(
      element?.shadowRoot ?? element?.attachShadow({ mode: "open" }) ?? null,
    );
  }, []);

  useEffect(() => {
    if (!scopeWrapper) return;
    return previewShortcut.registerCommand({
      keys: "F8",
      scope: scopeWrapper,
      onTrigger: () => setScopeActivations((count) => count + 1),
    });
  }, [scopeWrapper]);

  return (
    <div className="shadow-slot-lab">
      <div className="shadow-slot-heading">
        <strong>Assigned slot boundary</strong>
        <label className="shadow-slot-toggle">
          <input
            checked={referenceInert}
            onChange={(event) => setReferenceInert(event.currentTarget.checked)}
            type="checkbox"
          />
          Inert reference
        </label>
      </div>
      <div data-slot-host ref={setHost}>
        <ShortcutCommand
          className="shadow-slot-action"
          keys="F7"
          onClick={() => setReferenceActivations((count) => count + 1)}
          scope={null}
          slot="reference"
          type="button"
        >
          Slotted reference
          <Shortcut alwaysVisible />
        </ShortcutCommand>
        <button className="shadow-slot-action" slot="scope" type="button">
          Slotted scope target
          <kbd aria-hidden="true">F8</kbd>
        </button>
      </div>
      {shadowRoot
        ? createPortal(
            <>
              <style>{slotStyles}</style>
              <div className="slot-boundaries">
                <div
                  className="slot-boundary"
                  ref={(element) => {
                    element?.toggleAttribute("inert", referenceInert);
                  }}
                >
                  <slot name="reference" />
                </div>
                <div className="slot-boundary" ref={setScopeWrapper}>
                  <slot name="scope" />
                </div>
              </div>
            </>,
            shadowRoot,
          )
        : null}
      <div className="shadow-slot-results">
        <output aria-label="Slotted reference activations">
          {referenceActivations} reference activations
        </output>
        <output aria-label="Slotted scope activations">
          {scopeActivations} scope activations
        </output>
      </div>
    </div>
  );
}

function PreviewCanvas({ attached, refreshes }: PreviewCanvasProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  return (
    <ShortcutScope ref={scopeRef}>
      <style>{frameStyles}</style>
      <div className="frame-app">
        <div className="frame-bar">
          <div className="frame-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <span
            className="frame-connection"
            data-attached={attached || undefined}
          >
            {attached ? "Keyboard bridge connected" : "Keyboard bridge offline"}
          </span>
        </div>
        <div className="frame-card">
          <nav className="frame-nav" aria-label="Preview navigation">
            <span className="frame-logo">
              <span>A</span>
              Atelier
            </span>
            <span className="frame-nav-links">
              <span>Work</span>
              <span>Studio</span>
              <span>Contact</span>
            </span>
          </nav>
          <div className="frame-hero">
            <div>
              <p className="frame-kicker">Independent creative studio</p>
              <h2>Ideas with a little more gravity.</h2>
              <p className="frame-copy">
                We shape digital identities and memorable products for teams
                that care about the details.
              </p>
              <div className="frame-actions">
                <button className="frame-button" type="button">
                  Select hero card
                </button>
                <span className="frame-revision">Revision {refreshes + 1}</span>
              </div>
            </div>
            <div
              aria-label="Abstract sunset artwork"
              className="frame-art"
              role="img"
            />
          </div>
          <div className="frame-fields">
            <label className="frame-field">
              Preview title
              <input
                className="frame-title"
                defaultValue="Ideas with a little more gravity."
              />
            </label>
            <span className="frame-shortcut">
              Refresh
              <Shortcut alwaysVisible command="refresh-preview" />
            </span>
          </div>
        </div>
      </div>
    </ShortcutScope>
  );
}

function ShadowRealm() {
  const scopeRef = useRef<HTMLDivElement>(null);
  return (
    <ShortcutScope ref={scopeRef}>
      <style>{shadowStyles}</style>
      <section className="shadow-card" aria-labelledby="shadow-heading">
        <div className="shadow-heading">
          <div>
            <p>Open shadow root</p>
            <h2 id="shadow-heading">Realm relay</h2>
          </div>
          <span className="shadow-badge">Composed</span>
        </div>
        <ShortcutCommand
          className="shadow-command"
          command="refresh-preview"
          type="button"
        >
          Refresh from shadow root
          <Shortcut alwaysVisible />
        </ShortcutCommand>
        <label className="shadow-field">
          Shadow note
          <input
            className="shadow-input"
            placeholder="Type without refreshing"
          />
        </label>
        <SlottedBoundary />
        <span className="shadow-safety">
          Outside the field, the composed path finds the internal control.
          Inside it, the textbox guard prevents refresh.
        </span>
      </section>
    </ShortcutScope>
  );
}

export default function Example() {
  const parentScopeRef = useRef<HTMLDivElement>(null);
  const frameDetachRef = useRef<(() => void) | null>(null);
  const shouldAttachFrameRef = useRef(false);
  const mounted = useSyncExternalStore(
    subscribeToClient,
    () => true,
    () => false,
  );
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [frameBody, setFrameBody] = useState<HTMLElement | null>(null);
  const [frameDocument, setFrameDocument] = useState<Document | null>(null);
  const [attachFrame, setAttachFrame] = useState(false);
  const [refreshes, setRefreshes] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const frameAttached = attachFrame && !!frameDocument;
  // The module store infers its platform. Keep the first browser render equal
  // to the server render, then expose platform-specific output after mount.
  const [canonicalRefreshKeys] = mounted
    ? previewShortcut.getKeys("refresh-preview")
    : [];
  const formattedRefreshKeys = canonicalRefreshKeys
    ? previewShortcut.formatKeys(canonicalRefreshKeys)
    : "";

  const setFrame = useCallback((element: HTMLIFrameElement | null) => {
    frameDetachRef.current?.();
    frameDetachRef.current = null;
    const document = element?.contentDocument ?? null;
    if (document && shouldAttachFrameRef.current) {
      frameDetachRef.current = previewShortcut.attach(document);
    }
    setFrameDocument(document);
    setFrameBody(document?.body ?? null);
  }, []);

  const setShadowHost = useCallback((element: HTMLDivElement | null) => {
    setShadowRoot(
      element?.shadowRoot ?? element?.attachShadow({ mode: "open" }) ?? null,
    );
  }, []);

  const updateFrameAttachment = (enabled: boolean) => {
    shouldAttachFrameRef.current = enabled;
    frameDetachRef.current?.();
    frameDetachRef.current = null;
    if (enabled && frameDocument) {
      frameDetachRef.current = previewShortcut.attach(frameDocument);
    }
    setAttachFrame(enabled);
  };

  useEffect(() => {
    const onRefresh = (source: string) => {
      setRefreshes((count) => count + 1);
      setEvents((events) => [`Refresh from ${source}`, ...events.slice(0, 2)]);
    };
    refreshSubscribers.add(onRefresh);
    return () => {
      refreshSubscribers.delete(onRefresh);
    };
  }, []);

  useEffect(() => {
    return () => {
      frameDetachRef.current?.();
      frameDetachRef.current = null;
    };
  }, []);

  return (
    <ShortcutProvider store={previewShortcut}>
      <div className="ps-app">
        <header className="ps-header">
          <div className="ps-brand">
            <span className="ps-brand-icon">
              <Icon name="bolt" />
            </span>
            <span>
              <strong>Preview Studio</strong>
              <small>Cross-realm keyboard lab</small>
            </span>
          </div>
          <div className="ps-header-meta">
            <span className="ps-sync-dot" />
            Draft synced
            <span className="ps-avatar">AL</span>
          </div>
        </header>

        <main className="ps-main">
          <aside className="ps-sidebar" aria-labelledby="project-heading">
            <div>
              <p className="ps-eyebrow">Workspace</p>
              <h1 id="project-heading">Atelier launch</h1>
              <p className="ps-description">
                Test one shortcut store across the parent page, an open shadow
                root, and a same-origin frame.
              </p>
            </div>

            <ol className="ps-steps">
              <li className="ps-step-complete">
                <span>1</span>
                <div>
                  <strong>Parent ready</strong>
                  <small>Provider attached</small>
                </div>
              </li>
              <li data-current={!frameAttached || undefined}>
                <span>2</span>
                <div>
                  <strong>Bridge the frame</strong>
                  <small>{frameAttached ? "Connected" : "Waiting"}</small>
                </div>
              </li>
              <li data-current={frameAttached || undefined}>
                <span>3</span>
                <div>
                  <strong>Test the canvas</strong>
                  <small>{frameAttached ? "Ready to try" : "Locked"}</small>
                </div>
              </li>
            </ol>

            <div className="ps-shadow-wrap">
              <div data-shadow-host ref={setShadowHost} />
              {shadowRoot ? createPortal(<ShadowRealm />, shadowRoot) : null}
            </div>

            <div className="ps-note">
              <Icon name="bolt" />
              <div>
                <strong>Textbox guard</strong>
                <span>
                  Refresh explicitly ignores textboxes, even when their document
                  is attached.
                </span>
              </div>
            </div>
          </aside>

          <ShortcutScope
            ref={parentScopeRef}
            aria-labelledby="canvas-heading"
            className="ps-workspace"
            role="region"
          >
            <div className="ps-toolbar">
              <div>
                <p className="ps-eyebrow">Live canvas</p>
                <h2 id="canvas-heading">Homepage preview</h2>
              </div>
              <div className="ps-toolbar-actions">
                <label className="ps-switch">
                  <input
                    checked={attachFrame}
                    onChange={(event) =>
                      updateFrameAttachment(event.currentTarget.checked)
                    }
                    type="checkbox"
                  />
                  <span aria-hidden="true" />
                  Attach frame shortcuts
                </label>
                <button
                  aria-keyshortcuts={canonicalRefreshKeys}
                  className="ps-button ps-button-muted"
                  onClick={() => previewShortcut.trigger("refresh-preview")}
                  type="button"
                >
                  <Icon name="refresh" />
                  Refresh preview
                  <kbd aria-hidden="true">{formattedRefreshKeys}</kbd>
                </button>
                <button className="ps-button ps-button-primary" type="button">
                  <Icon name="send" />
                  Publish
                </button>
              </div>
            </div>

            <div className="ps-canvas-shell">
              <div className="ps-canvas-topbar">
                <span className="ps-page-name">atelier.studio / home</span>
                <span className="ps-viewport">1280 × 800</span>
                <span
                  aria-label="Frame attachment"
                  className="ps-attach-status"
                  data-attached={frameAttached || undefined}
                  role="status"
                >
                  {frameAttached ? "Frame attached" : "Frame detached"}
                </span>
              </div>
              <iframe
                className="ps-frame"
                ref={setFrame}
                title="Live preview canvas"
              />
              {frameBody
                ? createPortal(
                    <PreviewCanvas
                      attached={frameAttached}
                      refreshes={refreshes}
                    />,
                    frameBody,
                  )
                : null}
            </div>

            <footer className="ps-footer">
              <div className="ps-refresh-count">
                <span className="ps-pulse" />
                <output aria-label="Preview refreshes">
                  {refreshes} preview refreshes
                </output>
              </div>
              <div
                aria-label="Refresh event log"
                className="ps-event-log"
                role="log"
              >
                {events.length ? (
                  events.map((event, index) => (
                    <span key={`${event}-${index}`}>{event}</span>
                  ))
                ) : (
                  <span>No refresh events yet</span>
                )}
              </div>
              <span className="ps-store-chip">One store · 3 realms</span>
            </footer>
          </ShortcutScope>
        </main>
      </div>
    </ShortcutProvider>
  );
}
