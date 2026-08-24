import * as Ariakit from "@ariakit/react";
import { useState } from "react";
import type { DemoIconName } from "../demo-shell.react.tsx";
import { DemoIcon, DemoShell, DemoSwitch } from "../demo-shell.react.tsx";
import "../style.css";

type CommandId =
  | "command-palette"
  | "quick-search"
  | "save"
  | "zen-mode"
  | "zoom-in";
type Platform = "apple" | "other" | "windows";
type Presentation = "english" | "german" | "symbols";
type ShortcutOverrides = Partial<Record<CommandId, string | null>>;
type ShortcutKeysByCommand = Record<CommandId, string[]>;

interface ShortcutDefinition {
  command: CommandId;
  description: string;
  enabledInTextbox: boolean;
  icon: DemoIconName;
  keys: string;
  label: string;
}

const shortcutDefinitions: ShortcutDefinition[] = [
  {
    command: "command-palette",
    description: "Search every action",
    enabledInTextbox: false,
    icon: "command",
    keys: "Mod+K",
    label: "Command palette",
  },
  {
    command: "save",
    description: "Save the current document",
    enabledInTextbox: false,
    icon: "document",
    keys: "Mod+S",
    label: "Save document",
  },
  {
    command: "quick-search",
    description: "Jump to a page or person",
    enabledInTextbox: false,
    icon: "search",
    keys: "/ Mod+P",
    label: "Quick search",
  },
  {
    command: "zoom-in",
    description: "Increase the editor scale",
    enabledInTextbox: false,
    icon: "sparkles",
    keys: "Mod+Plus",
    label: "Zoom in",
  },
  {
    command: "zen-mode",
    description: "Hide everything but the page",
    enabledInTextbox: false,
    icon: "book",
    keys: "Space",
    label: "Zen mode",
  },
];

const formatting = {
  english: {
    glyphs: {
      "+": " + ",
      Alt: "Alt",
      Control: "Control",
      Meta: "Command",
      Shift: "Shift",
    },
    keyNames: {
      Plus: "Plus",
      Space: "Space",
    },
  },
  german: {
    glyphs: {
      "+": " + ",
      Alt: "Alt",
      Control: "Strg",
      Meta: "Befehl",
      Shift: "Umschalt",
    },
    keyNames: {
      Alt: "Alt",
      Control: "Strg",
      Meta: "Befehl",
      Plus: "Plus",
      Shift: "Umschalt",
      Space: "Leertaste",
    },
  },
  symbols: {
    glyphs: {},
    keyNames: {
      Plus: "+",
      Space: "Space",
    },
  },
} satisfies Record<
  Presentation,
  { glyphs: Record<string, string>; keyNames: Record<string, string> }
>;

function getDefinition(command: CommandId) {
  const definition = shortcutDefinitions.find(
    (definition) => definition.command === command,
  );
  if (!definition) {
    throw new Error(`Unknown command: ${command}`);
  }
  return definition;
}

function getCanonicalKeys(command: CommandId, overrides: ShortcutOverrides) {
  if (Object.hasOwn(overrides, command)) {
    return overrides[command] ?? null;
  }
  return getDefinition(command).keys;
}

function getShortcutConflicts(keysByCommand: ShortcutKeysByCommand) {
  const commandsByKeys = new Map<string, Set<CommandId>>();
  for (const { command } of shortcutDefinitions) {
    for (const keys of keysByCommand[command]) {
      const commands = commandsByKeys.get(keys) ?? new Set<CommandId>();
      commands.add(command);
      commandsByKeys.set(keys, commands);
    }
  }

  const conflicts = new Map<CommandId, Set<CommandId>>();
  for (const commands of commandsByKeys.values()) {
    if (commands.size < 2) {
      continue;
    }
    for (const command of commands) {
      const otherCommands = conflicts.get(command) ?? new Set<CommandId>();
      for (const otherCommand of commands) {
        if (otherCommand === command) {
          continue;
        }
        otherCommands.add(otherCommand);
      }
      conflicts.set(command, otherCommands);
    }
  }
  return conflicts;
}

function getConflictLabel(
  command: CommandId,
  conflicts: Map<CommandId, Set<CommandId>>,
) {
  const otherCommand = conflicts.get(command)?.values().next().value;
  if (!otherCommand) {
    return undefined;
  }
  return getDefinition(otherCommand).label;
}

function useShortcutKeysByCommand(
  store: ReturnType<typeof Ariakit.useShortcutStore>,
): ShortcutKeysByCommand {
  const commandPalette = Ariakit.useShortcutKeys({
    command: "command-palette",
    store,
  });
  const quickSearch = Ariakit.useShortcutKeys({
    command: "quick-search",
    store,
  });
  const save = Ariakit.useShortcutKeys({ command: "save", store });
  const zenMode = Ariakit.useShortcutKeys({ command: "zen-mode", store });
  const zoomIn = Ariakit.useShortcutKeys({ command: "zoom-in", store });
  return {
    "command-palette": commandPalette,
    "quick-search": quickSearch,
    save,
    "zen-mode": zenMode,
    "zoom-in": zoomIn,
  };
}

interface SettingsCommandRegistrationProps {
  definition: ShortcutDefinition;
  onTrigger: (command: CommandId) => void;
}

function SettingsCommandRegistration({
  definition,
  onTrigger,
}: SettingsCommandRegistrationProps) {
  Ariakit.useShortcutCommand({
    command: definition.command,
    enabledInTextbox: definition.enabledInTextbox,
    keys: definition.keys,
    onTrigger: () => onTrigger(definition.command),
    preventDefault: true,
  });
  return null;
}

interface ShortcutAlternativesProps {
  alternatives: string[];
  store: ReturnType<typeof Ariakit.useShortcutStore>;
}

function ShortcutAlternatives({
  alternatives,
  store,
}: ShortcutAlternativesProps) {
  if (!alternatives.length) {
    return <span className="shortcut-empty">Unassigned</span>;
  }
  return (
    <span className="shortcut-alternatives">
      {alternatives.map((keys, index) => (
        <span className="shortcut-alternative" key={keys}>
          {index > 0 && <span>or</span>}
          <Ariakit.Shortcut alwaysVisible keys={keys} store={store} />
        </span>
      ))}
    </span>
  );
}

interface ShortcutRowProps {
  alternatives: string[];
  conflictWith?: string;
  definition: ShortcutDefinition;
  keys: string | null;
  onKeysChange: (keys: string | null | undefined) => void;
  recording: boolean;
  setRecording: (recording: boolean) => void;
  store: ReturnType<typeof Ariakit.useShortcutStore>;
}

function ShortcutRow({
  alternatives,
  conflictWith,
  definition,
  keys,
  onKeysChange,
  recording,
  setRecording,
  store,
}: ShortcutRowProps) {
  const overridden = keys !== definition.keys;
  const cleared = keys === null;
  const conflictId = `${definition.command}-conflict`;
  const helpId = `${definition.command}-recording-help`;
  const descriptionIds = [
    recording ? helpId : null,
    conflictWith ? conflictId : null,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      aria-label={`${definition.label} settings`}
      className="settings-row"
      data-conflict={!!conflictWith}
      role="group"
    >
      <div className="shortcut-name">
        <span className="shortcut-name-icon">
          <DemoIcon name={definition.icon} size={15} />
        </span>
        <span>
          <strong>{definition.label}</strong>
          <small>{definition.description}</small>
          <code>Canonical: {alternatives.join(" ") || "null"}</code>
        </span>
      </div>
      <ShortcutAlternatives alternatives={alternatives} store={store} />
      <div className="shortcut-input-wrap">
        <span className="shortcut-input-leading">
          <DemoIcon name="command" size={13} />
        </span>
        <Ariakit.ShortcutInput
          aria-describedby={descriptionIds || undefined}
          aria-label={`Record shortcut for ${definition.label}`}
          cancelKeys="Escape"
          className="shortcut-input ak-input"
          clearKeys="Backspace Delete"
          keys={keys ?? ""}
          recording={recording}
          setKeys={onKeysChange}
          setRecording={setRecording}
          store={store}
        />
        {recording && (
          <span className="recording-help" id={helpId}>
            Press a shortcut · Backspace or Delete clears · Escape cancels
          </span>
        )}
      </div>
      <div className="row-actions">
        <button
          aria-label={`Clear ${definition.label}`}
          className="row-action"
          disabled={cleared}
          onClick={() => onKeysChange(null)}
          type="button"
        >
          Clear
        </button>
        <button
          aria-label={`Reset ${definition.label}`}
          className="row-action"
          disabled={!overridden}
          onClick={() => onKeysChange(undefined)}
          type="button"
        >
          Reset
        </button>
      </div>
      {conflictWith && (
        <p className="conflict-note" id={conflictId}>
          Also assigned to {conflictWith}. Choose a different shortcut.
        </p>
      )}
    </div>
  );
}

interface SettingsProps {
  store: ReturnType<typeof Ariakit.useShortcutStore>;
  platform: Platform;
  presentation: Presentation;
  setPlatform: (platform: Platform) => void;
  setPresentation: (presentation: Presentation) => void;
}

function Settings({
  platform,
  presentation,
  setPlatform,
  setPresentation,
  store,
}: SettingsProps) {
  // oxlint-disable-next-line react/hooks -- public hook method
  const enabled = store.useState("enabled");
  const [overrides, setOverrides] = useState<ShortcutOverrides>({});
  const [recordingCommand, setRecordingCommand] = useState<CommandId | null>(
    null,
  );
  const [lastAction, setLastAction] = useState("No command triggered yet");
  const keysByCommand = useShortcutKeysByCommand(store);
  const conflicts = getShortcutConflicts(keysByCommand);

  const setKeys = (command: CommandId, keys: string | null | undefined) => {
    store.setKeys(command, keys);
    setOverrides((current) => {
      if (keys === undefined) {
        const remaining = { ...current };
        delete remaining[command];
        return remaining;
      }
      return { ...current, [command]: keys };
    });
  };

  const resetAll = () => {
    for (const { command } of shortcutDefinitions) {
      store.setKeys(command, undefined);
    }
    setOverrides({});
    setRecordingCommand(null);
  };

  return (
    <DemoShell
      active="settings"
      description="Record once, display naturally on every platform, and keep conflicts under your app’s control."
      eyebrow="Preferences / Keyboard"
      title="Keyboard shortcuts"
      toolbar={
        <div className="master-control">
          <DemoSwitch
            checked={enabled}
            label="Shortcuts"
            onChange={store.setEnabled}
          />
        </div>
      }
    >
      {shortcutDefinitions.map((definition) => (
        <SettingsCommandRegistration
          definition={definition}
          key={definition.command}
          onTrigger={(command) =>
            setLastAction(`${getDefinition(command).label} triggered`)
          }
        />
      ))}

      <div className="settings-layout">
        <section
          className="settings-card"
          aria-labelledby="shortcut-list-title"
        >
          <header className="settings-card-header">
            <div>
              <h2 id="shortcut-list-title">Workspace shortcuts</h2>
              <p>Click a field, then press the keys you want to use.</p>
            </div>
            <button
              className="quiet-button ak-button"
              onClick={resetAll}
              type="button"
            >
              Reset all
            </button>
          </header>

          <div className="settings-options">
            <fieldset className="settings-fieldset">
              <legend>Keyboard platform</legend>
              <div className="choice-group">
                {(
                  [
                    ["apple", "Apple"],
                    ["windows", "Windows"],
                    ["other", "Other"],
                  ] as const
                ).map(([value, label]) => (
                  <label className="choice-card" key={value}>
                    <input
                      checked={platform === value}
                      name="platform"
                      onChange={() => setPlatform(value)}
                      type="radio"
                      value={value}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="settings-fieldset">
              <legend>Presentation</legend>
              <div className="choice-group">
                {(
                  [
                    ["symbols", "Symbols"],
                    ["english", "English prose"],
                    ["german", "German prose"],
                  ] as const
                ).map(([value, label]) => (
                  <label className="choice-card" key={value}>
                    <input
                      checked={presentation === value}
                      name="presentation"
                      onChange={() => setPresentation(value)}
                      type="radio"
                      value={value}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="settings-table-head" aria-hidden="true">
            <span>Command</span>
            <span>Preview</span>
            <span>Record shortcut</span>
            <span>Actions</span>
          </div>
          <div aria-label="Shortcut assignments" role="group">
            {shortcutDefinitions.map((definition) => (
              <ShortcutRow
                alternatives={keysByCommand[definition.command]}
                conflictWith={getConflictLabel(definition.command, conflicts)}
                definition={definition}
                key={definition.command}
                keys={getCanonicalKeys(definition.command, overrides)}
                onKeysChange={(keys) => setKeys(definition.command, keys)}
                recording={recordingCommand === definition.command}
                setRecording={(recording) =>
                  setRecordingCommand(recording ? definition.command : null)
                }
                store={store}
              />
            ))}
          </div>
        </section>

        <aside className="settings-aside" aria-label="Shortcut details">
          <section className="settings-aside-card try-conflict-card">
            <h2>Conflict policy stays local</h2>
            <p>
              Atlas compares canonical assignments before it accepts a saved
              profile. Ariakit only reports the keys.
            </p>
            <button
              className="try-conflict-button"
              onClick={() => setKeys("command-palette", "Mod+P")}
              type="button"
            >
              <DemoIcon name="bolt" size={14} />
              Try a duplicate assignment
            </button>
            <div
              className="conflict-summary"
              data-clear={!conflicts.size}
              aria-live="polite"
            >
              <DemoIcon name={conflicts.size ? "bolt" : "check"} size={13} />
              {conflicts.size
                ? `${conflicts.size} conflicting commands`
                : "No shortcut conflicts"}
            </div>
          </section>

          <section className="settings-aside-card">
            <h2>Live command check</h2>
            <p>
              Focus outside a field and press a configured shortcut. Recording
              fields keep ordinary typing safe.
            </p>
            <div
              aria-label="Last command"
              aria-live="polite"
              className="settings-status"
              role="status"
            >
              <span className="settings-status-mark">
                <DemoIcon name="check" size={14} />
              </span>
              <span>
                <strong>{lastAction}</strong>
                <small>{enabled ? "Listening" : "Shortcuts paused"}</small>
              </span>
            </div>
          </section>

          <section className="settings-aside-card rtl-preview" dir="rtl">
            <h2>תצוגה מימין לשמאל</h2>
            <p>
              Shortcut order stays readable inside right-to-left interfaces.
            </p>
            <div className="rtl-preview-surface">
              <span>שמירת מסמך</span>
              <span className="shortcut-hint">
                <Ariakit.Shortcut alwaysVisible command="save" store={store} />
              </span>
            </div>
          </section>
        </aside>
      </div>
    </DemoShell>
  );
}

export default function Example() {
  const [platform, setPlatform] = useState<Platform>("apple");
  const [presentation, setPresentation] = useState<Presentation>("symbols");
  const currentFormatting = formatting[presentation];
  const store = Ariakit.useShortcutStore({
    glyphs: currentFormatting.glyphs,
    keyNames: currentFormatting.keyNames,
    platform,
  });
  return (
    <Ariakit.ShortcutProvider store={store}>
      <Settings
        platform={platform}
        presentation={presentation}
        setPlatform={setPlatform}
        setPresentation={setPresentation}
        store={store}
      />
    </Ariakit.ShortcutProvider>
  );
}
