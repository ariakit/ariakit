import * as Ariakit from "@ariakit/react";
import { useMemo, useRef, useState } from "react";
import type { DemoIconName } from "../demo-shell.react.tsx";
import { DemoIcon, DemoShell, DemoSwitch } from "../demo-shell.react.tsx";
import "../style.css";
import "./command-menu.css";

type CommandId =
  | "bold"
  | "go-overview"
  | "palette"
  | "publish"
  | "reference-fallback"
  | "save";
type TriggerSource =
  | "Command palette"
  | "Keyboard"
  | "Menu"
  | "Programmatic"
  | "Toolbar";

interface Activity {
  command: CommandId;
  keys: string[];
  label: string;
  source: TriggerSource;
}

interface CommandDefinition {
  command: CommandId;
  description: string;
  icon: DemoIconName;
  label: string;
}

const commandDefinitions: CommandDefinition[] = [
  {
    command: "save",
    description: "Save changes to the workspace",
    icon: "document",
    label: "Save document",
  },
  {
    command: "bold",
    description: "Toggle bold text formatting",
    icon: "sparkles",
    label: "Toggle bold",
  },
  {
    command: "go-overview",
    description: "Return to the project overview",
    icon: "grid",
    label: "Go to overview",
  },
  {
    command: "publish",
    description: "Available after review is complete",
    icon: "arrow-up-right",
    label: "Publish document",
  },
];

interface ShortcutPreviewProps {
  command: CommandId;
  alwaysVisible?: boolean;
}

function ShortcutPreview({
  alwaysVisible = false,
  command,
}: ShortcutPreviewProps) {
  const store = Ariakit.useShortcutContext();
  const alternatives = Ariakit.useShortcutKeys({ command, store });
  if (!alternatives.length) {
    return <span className="shortcut-empty">None</span>;
  }
  return (
    <span className="shortcut-hint">
      {alternatives.map((keys, index) => (
        <span className="shortcut-alternative" key={keys}>
          {index > 0 && <span className="shortcut-or">or</span>}
          <Ariakit.Shortcut
            alwaysVisible={alwaysVisible}
            keys={keys}
            store={store}
          />
        </span>
      ))}
    </span>
  );
}

interface InheritedShortcutPreviewProps {
  alwaysVisible?: boolean;
}

function InheritedShortcutPreview({
  alwaysVisible = false,
}: InheritedShortcutPreviewProps) {
  return (
    <span className="shortcut-hint">
      <Ariakit.Shortcut alwaysVisible={alwaysVisible} />
    </span>
  );
}

interface CommandRegistryProps {
  onBold: () => void;
  onGoToOverview: () => void;
  onPublish: () => void;
  onSave: () => void;
}

function CommandRegistry({
  onBold,
  onGoToOverview,
  onPublish,
  onSave,
}: CommandRegistryProps) {
  Ariakit.useShortcutCommand({
    command: "save",
    keys: "Mod+S",
    onTrigger: onSave,
    preventDefault: true,
  });
  Ariakit.useShortcutCommand({
    command: "bold",
    keys: "Mod+B",
    onTrigger: onBold,
    preventDefault: true,
  });
  Ariakit.useShortcutCommand({
    command: "go-overview",
    enabledInTextbox: false,
    keys: "G",
    onTrigger: onGoToOverview,
  });
  Ariakit.useShortcutCommand({
    command: "publish",
    enabled: false,
    keys: "Mod+Shift+P",
    onTrigger: onPublish,
    preventDefault: true,
  });
  return null;
}

interface ResilienceLabProps {
  store: ReturnType<typeof Ariakit.useShortcutStore>;
}

function ResilienceLab({ store }: ResilienceLabProps) {
  const scopedRegionRef = useRef<HTMLDivElement>(null);
  const [referenceRuns, setReferenceRuns] = useState(0);
  const [numberShortcutRuns, setNumberShortcutRuns] = useState(0);
  const [declinedRuns, setDeclinedRuns] = useState(0);
  const [fallbackRuns, setFallbackRuns] = useState(0);
  const [scopedRuns, setScopedRuns] = useState(0);

  Ariakit.useShortcutCommand({
    command: "estimate-seven",
    keys: "7",
    onTrigger: () => setNumberShortcutRuns((count) => count + 1),
  });

  Ariakit.useShortcutCommand({
    command: "decline-fallback",
    keys: "X",
    onTrigger: () => setFallbackRuns((count) => count + 1),
  });
  // The later candidate gets priority, then returning false lets dispatch
  // continue to the fallback registered directly above it.
  Ariakit.useShortcutCommand({
    command: "decline-first",
    keys: "X",
    onTrigger: () => {
      setDeclinedRuns((count) => count + 1);
      return false;
    },
  });

  Ariakit.useShortcutCommand({
    command: "scoped-review",
    keys: "E",
    onTrigger: () => setScopedRuns((count) => count + 1),
    scope: scopedRegionRef,
  });

  return (
    <section className="resilience-lab" aria-labelledby="resilience-heading">
      <header className="resilience-header">
        <div>
          <span className="resilience-eyebrow">Resilience lab</span>
          <h2 id="resilience-heading">Shortcuts that fail gracefully</h2>
          <p>
            Four safeguards keep commands predictable when the DOM, focus, or
            handler changes underneath them.
          </p>
        </div>
        <span className="resilience-ready">
          <DemoIcon name="check" size={13} />4 safeguards live
        </span>
      </header>

      <div className="resilience-grid">
        <article className="resilience-case">
          <div className="resilience-case-heading">
            <span className="resilience-case-number">01</span>
            <div>
              <h3>Live reference wins</h3>
              <p>Unavailable copies yield to the same named command.</p>
            </div>
          </div>
          <div
            aria-label="Same-name command references"
            className="resilience-references"
            role="group"
          >
            <Ariakit.ShortcutCommand
              className="resilience-reference"
              command="reference-fallback"
              data-state="live"
              keys="R F2"
              onClick={() => setReferenceRuns((count) => count + 1)}
            >
              <span className="resilience-reference-dot" />
              Live reference
              <InheritedShortcutPreview alwaysVisible />
            </Ariakit.ShortcutCommand>
            <div
              className="resilience-inert-reference"
              ref={(element) => element?.setAttribute("inert", "")}
            >
              <Ariakit.ShortcutCommand
                className="resilience-reference"
                command="reference-fallback"
                data-state="inert"
              >
                <span className="resilience-reference-dot" />
                Inert reference
                <InheritedShortcutPreview alwaysVisible />
              </Ariakit.ShortcutCommand>
            </div>
            <Ariakit.ShortcutCommand
              className="resilience-reference"
              command="reference-fallback"
              data-state="disabled"
              disabled
            >
              <span className="resilience-reference-dot" />
              Disabled reference
              <InheritedShortcutPreview alwaysVisible />
            </Ariakit.ShortcutCommand>
          </div>
          <div className="resilience-result-line">
            <output
              aria-label="Reference fallback"
              className="resilience-result"
              role="status"
            >
              {referenceRuns
                ? `Live reference handled R · Runs: ${referenceRuns}`
                : "Waiting for R"}
            </output>
            <ShortcutPreview alwaysVisible command="reference-fallback" />
          </div>
        </article>

        <article className="resilience-case">
          <div className="resilience-case-heading">
            <span className="resilience-case-number">02</span>
            <div>
              <h3>Number fields keep typing</h3>
              <p>A bare printable key stays input inside a number field.</p>
            </div>
          </div>
          <label className="resilience-number-field">
            <span>Estimate points</span>
            <input
              className="ak-input"
              inputMode="numeric"
              min="0"
              placeholder="Type 7 here"
              type="number"
            />
          </label>
          <button className="resilience-try" type="button">
            Try <kbd>7</kbd> outside
          </button>
          <output
            aria-label="Number input shortcut"
            className="resilience-result"
            role="status"
          >
            Shortcut runs: {numberShortcutRuns}
          </output>
        </article>

        <article className="resilience-case">
          <div className="resilience-case-heading">
            <span className="resilience-case-number">03</span>
            <div>
              <h3>Decline, then continue</h3>
              <p>A handler can pass the key to the next candidate.</p>
            </div>
          </div>
          <div className="resilience-chain" aria-hidden="true">
            <span>First handler</span>
            <span className="resilience-chain-arrow">declines →</span>
            <span>Fallback</span>
          </div>
          <button className="resilience-try" type="button">
            Try candidate chain <kbd aria-hidden="true">X</kbd>
          </button>
          <output
            aria-label="Declining candidate"
            className="resilience-result"
            role="status"
          >
            Declined: {declinedRuns} · Fallbacks: {fallbackRuns}
          </output>
        </article>

        <article className="resilience-case">
          <div className="resilience-case-heading">
            <span className="resilience-case-number">04</span>
            <div>
              <h3>Programmatic scope bypass</h3>
              <p>Code can run an explicit scope without moving focus.</p>
            </div>
          </div>
          <div
            aria-label="Scoped review region"
            className="resilience-scope"
            ref={scopedRegionRef}
            role="region"
            tabIndex={0}
          >
            <span className="resilience-scope-dot" />
            Scoped review region
            <kbd aria-hidden="true">E</kbd>
          </div>
          <button
            className="resilience-try"
            onClick={() => store.trigger("scoped-review")}
            type="button"
          >
            Run scoped command outside
          </button>
          <output
            aria-label="Scoped command"
            className="resilience-result"
            role="status"
          >
            Scoped command runs: {scopedRuns}
          </output>
        </article>
      </div>
    </section>
  );
}

interface EditorProps {
  store: ReturnType<typeof Ariakit.useShortcutStore>;
}

function Editor({ store }: EditorProps) {
  const dialog = Ariakit.useDialogStore();
  // oxlint-disable-next-line react/hooks -- public hook method
  const shortcutsEnabled = store.useState("enabled");
  const [activity, setActivity] = useState<Activity | null>(null);
  const [bold, setBold] = useState(false);
  const [query, setQuery] = useState("");
  const nextSource = useRef<TriggerSource | null>(null);

  const finishCommand = (
    command: CommandId,
    label: string,
    effect?: () => void,
  ) => {
    effect?.();
    setActivity({
      command,
      keys: store.getKeys(command),
      label,
      source: nextSource.current ?? "Keyboard",
    });
    nextSource.current = null;
  };

  const queueClickSource = (source: TriggerSource) => {
    if (!shortcutsEnabled) return;
    nextSource.current = source;
  };

  const triggerFrom = (command: CommandId, source: TriggerSource) => {
    nextSource.current = source;
    if (store.trigger(command)) return;
    nextSource.current = null;
  };

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return commandDefinitions;
    return commandDefinitions.filter(({ description, label }) =>
      `${label} ${description}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <DemoShell
      active="editor"
      description="A live document where one command can be reached from keys, controls, menus, or code."
      eyebrow="Atlas Notes / Document"
      title="Quarterly launch plan"
      toolbar={
        <div className="master-control">
          <DemoSwitch
            checked={shortcutsEnabled}
            label="Shortcuts"
            onChange={store.setEnabled}
          />
        </div>
      }
    >
      <CommandRegistry
        onBold={() =>
          finishCommand("bold", bold ? "Bold removed" : "Bold applied", () =>
            setBold((value) => !value),
          )
        }
        onGoToOverview={() => finishCommand("go-overview", "Overview opened")}
        onPublish={() => finishCommand("publish", "Document published")}
        onSave={() => finishCommand("save", "Document saved")}
      />

      <ResilienceLab store={store} />

      <section className="editor-card" aria-label="Document editor">
        <header className="editor-card-header">
          <div className="editor-document-meta">
            <span className="editor-document-icon">
              <DemoIcon name="document" />
            </span>
            <span>
              <strong>Quarterly launch plan</strong>
              <small>Edited just now · Autosaved</small>
            </span>
          </div>
          <div className="editor-card-actions">
            <button className="secondary-button ak-button" type="button">
              <DemoIcon name="users" size={15} />
              Share
            </button>
            <Ariakit.ShortcutCommand
              className="primary-button ak-button"
              command="palette"
              keys="Mod+K"
              onTrigger={dialog.show}
              preventDefault
            >
              <DemoIcon name="command" size={15} />
              Commands
              <InheritedShortcutPreview alwaysVisible />
            </Ariakit.ShortcutCommand>
          </div>
        </header>

        <Ariakit.Toolbar className="editor-toolbar" aria-label="Formatting">
          <Ariakit.ShortcutCommand
            aria-pressed={bold}
            className="toolbar-button"
            command="bold"
            onClickCapture={() => {
              queueClickSource("Toolbar");
            }}
            render={<Ariakit.ToolbarItem />}
          >
            <strong aria-hidden="true">B</strong>
            <span className="sr-only">Bold</span>
            <InheritedShortcutPreview />
          </Ariakit.ShortcutCommand>
          <Ariakit.ToolbarItem className="toolbar-button" aria-label="Italic">
            <em aria-hidden="true">I</em>
          </Ariakit.ToolbarItem>
          <Ariakit.ToolbarItem
            className="toolbar-button"
            aria-label="Underline"
          >
            <span aria-hidden="true" style={{ textDecoration: "underline" }}>
              U
            </span>
          </Ariakit.ToolbarItem>
          <span className="toolbar-separator" aria-hidden="true" />
          <Ariakit.ShortcutCommand
            className="toolbar-button"
            command="save"
            onClickCapture={() => {
              queueClickSource("Toolbar");
            }}
            render={<Ariakit.ToolbarItem />}
          >
            <DemoIcon name="document" size={14} />
            Save
            <InheritedShortcutPreview />
          </Ariakit.ShortcutCommand>
          <span className="toolbar-spacer" />
          <Ariakit.ShortcutCommand
            className="toolbar-button"
            command="publish"
            disabled
            render={<Ariakit.ToolbarItem />}
          >
            Publish
            <InheritedShortcutPreview />
          </Ariakit.ShortcutCommand>
          <Ariakit.MenuProvider>
            <Ariakit.MenuButton className="toolbar-button" aria-label="More">
              <DemoIcon name="menu" size={16} />
            </Ariakit.MenuButton>
            <Ariakit.Menu
              className="editor-menu"
              gutter={7}
              portal
              unmountOnHide
            >
              <Ariakit.ShortcutCommand
                className="editor-menu-item"
                command="save"
                onClickCapture={() => {
                  queueClickSource("Menu");
                }}
                render={<Ariakit.MenuItem />}
              >
                <DemoIcon name="document" size={15} />
                Save document
                <InheritedShortcutPreview />
              </Ariakit.ShortcutCommand>
              <Ariakit.MenuItem
                className="editor-menu-item"
                onClick={() => {
                  triggerFrom("save", "Programmatic");
                }}
              >
                <DemoIcon name="bolt" size={15} />
                Save from code
              </Ariakit.MenuItem>
              <Ariakit.MenuSeparator className="editor-menu-separator" />
              <Ariakit.MenuItem className="editor-menu-item" disabled>
                <DemoIcon name="arrow-up-right" size={15} />
                Publish after review
              </Ariakit.MenuItem>
            </Ariakit.Menu>
          </Ariakit.MenuProvider>
        </Ariakit.Toolbar>

        <div className="editor-body">
          <article
            aria-label="Document canvas"
            className="editor-canvas"
            tabIndex={0}
          >
            <p className="editor-kicker">Q4 · Go-to-market</p>
            <h2>Make the launch feel inevitable.</h2>
            <p className="editor-lede">
              Align product, story, and customer proof around one clear moment.
              Every team should know what changes on launch day and why it
              matters.
            </p>
            <div className="editor-callout">
              <span className="editor-callout-icon">
                <DemoIcon name="sparkles" size={16} />
              </span>
              <div>
                <strong>Launch principle</strong>
                <p>
                  Show the workflow, not a feature list. Let customers see the
                  before and after in under sixty seconds.
                </p>
              </div>
            </div>
            <h3 className="editor-section-title">
              <span /> Milestones
            </h3>
            <textarea
              aria-label="Document body"
              className="editor-textarea ak-input"
              defaultValue={
                "Finalize the launch narrative with Research.\nRecord three customer workflows for the keynote.\nShip the enablement kit to regional teams."
              }
              style={{ fontWeight: bold ? 700 : undefined }}
            />
          </article>

          <aside className="editor-inspector" aria-label="Shortcut inspector">
            <h3>Shortcut inspector</h3>
            <dl>
              <div>
                <dt>Save command</dt>
                <dd>
                  <span className="shortcut-hint">
                    <Ariakit.Shortcut command="save" alwaysVisible />
                  </span>
                </dd>
              </div>
              <div>
                <dt>Outside text fields</dt>
                <dd>
                  Press <code>G</code> on the document canvas
                </dd>
              </div>
              <div>
                <dt>Inside text fields</dt>
                <dd>
                  <code>G</code> types normally in the editor
                </dd>
              </div>
              <div>
                <dt>Command state</dt>
                <dd>{shortcutsEnabled ? "Enabled" : "Paused"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section
        aria-label="Last shortcut"
        aria-live="polite"
        className="shortcut-status"
        role="status"
      >
        <span className="shortcut-status-icon">
          <DemoIcon name={activity ? "check" : "command"} size={16} />
        </span>
        <span className="shortcut-status-copy">
          <strong>{activity?.label ?? "Waiting for a shortcut"}</strong>
          <small>
            {activity
              ? `Source: ${activity.source} · Keys: ${activity.keys.join(" or ") || "None"}`
              : "Try the keyboard, a toolbar control, or store.trigger()"}
          </small>
        </span>
        {activity && <ShortcutPreview command={activity.command} />}
      </section>

      <Ariakit.Dialog
        backdrop={<div className="command-backdrop" />}
        className="command-dialog ak-dialog"
        portal
        store={dialog}
        unmountOnHide
      >
        <Ariakit.DialogHeading className="command-dialog-heading">
          Command palette
        </Ariakit.DialogHeading>
        <Ariakit.DialogDescription className="sr-only">
          Search and run a command in Quarterly launch plan.
        </Ariakit.DialogDescription>
        <div className="command-search">
          <DemoIcon name="search" size={19} />
          <input
            aria-label="Search commands"
            className="ak-input"
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search commands…"
            value={query}
          />
          <span className="command-escape">ESC</span>
        </div>
        <div className="command-list">
          <p className="command-group-label">Suggested</p>
          {filteredCommands.map((definition) => {
            const disabled = definition.command === "publish";
            return (
              <Ariakit.ShortcutCommand
                aria-label={definition.label}
                className="command-row"
                command={definition.command}
                disabled={disabled}
                key={definition.command}
                onClick={dialog.hide}
                onClickCapture={() => {
                  queueClickSource("Command palette");
                }}
                render={<Ariakit.Command />}
              >
                <span className="command-row-icon">
                  <DemoIcon name={definition.icon} size={16} />
                </span>
                <span className="command-row-copy">
                  <strong>{definition.label}</strong>
                  <small>{definition.description}</small>
                </span>
                <span className="command-row-shortcut shortcut-hint">
                  <Ariakit.Shortcut alwaysVisible />
                </span>
              </Ariakit.ShortcutCommand>
            );
          })}
          {!filteredCommands.length && (
            <p className="command-empty">No matching commands</p>
          )}
        </div>
        <footer className="command-footer">
          <span>
            <kbd>Tab</kbd>
            <kbd>Shift + Tab</kbd> Move
          </span>
          <span>
            <kbd>↵</kbd> Run focused
          </span>
          <span>Shortcuts stay in sync everywhere</span>
        </footer>
      </Ariakit.Dialog>
    </DemoShell>
  );
}

export default function Example() {
  const store = Ariakit.useShortcutStore();
  return (
    <Ariakit.ShortcutProvider store={store}>
      <Editor store={store} />
    </Ariakit.ShortcutProvider>
  );
}
