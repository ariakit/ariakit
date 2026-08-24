import {
  Composite,
  CompositeItem,
  CompositeProvider,
  Dialog,
  DialogDescription,
  DialogDismiss,
  DialogHeading,
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
  Shortcut,
  ShortcutCommand,
  ShortcutProvider,
  ShortcutScope,
  useShortcutCommand,
  useShortcutStore,
} from "@ariakit/react";
import type { RefObject } from "react";
import { useMemo, useRef, useState } from "react";
import "./style.css";

interface TaskItem {
  id: number;
  title: string;
  detail: string;
  label: string;
}

interface LaneProps {
  id: "inbox" | "week";
  eyebrow: string;
  title: string;
  tasks: TaskItem[];
  scopeRef: RefObject<HTMLDivElement | null>;
  onActivity: (message: string) => void;
  onQuickEdit: (lane: string, task: TaskItem) => void;
}

interface QuickEditDialogProps {
  task: TaskItem | null;
  lane: string;
  onClose: () => void;
  onInnerSave: () => void;
  workspaceSaves: number;
}

const inboxTasks: TaskItem[] = [
  {
    id: 1,
    title: "Map onboarding gaps",
    detail: "Customer journey · 2 notes",
    label: "Research",
  },
  {
    id: 2,
    title: "Draft launch brief",
    detail: "Northstar v2 · Today",
    label: "Writing",
  },
  {
    id: 3,
    title: "Review mobile metrics",
    detail: "Analytics · 4 charts",
    label: "Insights",
  },
];

const weekTasks: TaskItem[] = [
  {
    id: 11,
    title: "Prototype search states",
    detail: "Design system · Tuesday",
    label: "Design",
  },
  {
    id: 12,
    title: "Share research playback",
    detail: "Product sync · Wednesday",
    label: "Meeting",
  },
  {
    id: 13,
    title: "Polish release notes",
    detail: "Northstar v2 · Friday",
    label: "Writing",
  },
];

function Icon({ name }: { name: "archive" | "dots" | "plus" | "spark" }) {
  const paths = {
    archive: <path d="M4 7h16m-14 0 1 12h10l1-12M9 11h6M5 3h14v4H5z" />,
    dots: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
    plus: <path d="M12 5v14M5 12h14" />,
    spark: (
      <path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3Zm6 11 .75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14Z" />
    ),
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function LaneCommands({
  archiveTask,
  id,
}: {
  archiveTask: (source: string) => void;
  id: LaneProps["id"];
}) {
  useShortcutCommand({
    command: `${id}-archive`,
    keys: "Delete Backspace",
    onTrigger: (event) => archiveTask(event.source),
    preventDefault: true,
  });
  return null;
}

interface WorkspaceCommandRegistryProps {
  onSave: (source: string) => void;
}

function WorkspaceCommandRegistry({ onSave }: WorkspaceCommandRegistryProps) {
  useShortcutCommand({
    command: "workspace-save",
    enabledInTextbox: true,
    keys: "mod+S",
    onTrigger: (event) => onSave(event.source),
    preventDefault: true,
    scope: null,
  });
  return null;
}

interface QuickCaptureProps {
  onAddTask: (source: string) => void;
  onActivity: (message: string) => void;
}

function QuickCapture({ onActivity, onAddTask }: QuickCaptureProps) {
  const [captureCount, setCaptureCount] = useState(0);
  const [proxyCount, setProxyCount] = useState(0);

  const captureNote = (source: string) => {
    setCaptureCount((count) => count + 1);
    onActivity(`Captured a quick note by ${source}.`);
  };

  return (
    <CompositeProvider defaultActiveId="quick-note-route" virtualFocus>
      <Composite
        aria-label="Inbox capture routes"
        className="ns-quick-capture"
        onFocus={() => onActivity("Quick capture shortcuts are active.")}
        role="toolbar"
      >
        <span className="ns-quick-capture-icon">
          <Icon name="spark" />
        </span>
        <span className="ns-quick-capture-copy">
          <strong>Quick capture</strong>
          <small>Move between routes. N follows virtual focus.</small>
        </span>
        <output aria-label="Quick captures">
          <strong>{captureCount}</strong>
          captured · {proxyCount} proxied
        </output>
        <div className="ns-capture-routes">
          <ShortcutScope className="ns-quick-capture-scope" role="presentation">
            <ShortcutCommand
              className="ns-capture-route"
              command="quick-capture-new"
              keys="N"
              onKeyDown={(event) => {
                if (event.key.toLowerCase() !== "n") {
                  return;
                }
                setProxyCount((count) => count + 1);
              }}
              onTrigger={(event) => captureNote(event.source)}
              preventDefault={false}
              render={<CompositeItem id="quick-note-route" role="button" />}
            >
              Quick note
              <Shortcut className="ns-shortcut ns-scope-shortcut" />
            </ShortcutCommand>
          </ShortcutScope>
          <CompositeItem
            className="ns-capture-route"
            id="inbox-task-route"
            onClick={() => onAddTask("button")}
            role="button"
          >
            Inbox task
            <span aria-hidden="true" className="ns-route-key">
              N
            </span>
          </CompositeItem>
        </div>
      </Composite>
    </CompositeProvider>
  );
}

function Lane({
  id,
  eyebrow,
  title,
  tasks: initialTasks,
  scopeRef,
  onActivity,
  onQuickEdit,
}: LaneProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState(initialTasks[0]?.id ?? null);
  const nextTaskId = useRef(
    Math.max(0, ...initialTasks.map((task) => task.id)) + 1,
  );
  const selectedTask = tasks.find((task) => task.id === selectedId) ?? tasks[0];
  const titleLowercase = title.toLocaleLowerCase();

  const addTask = (source: string) => {
    const taskNumber = tasks.length + 1;
    const taskId = nextTaskId.current;
    nextTaskId.current += 1;
    const nextTask: TaskItem = {
      id: taskId,
      title: `Untitled ${titleLowercase} task ${taskNumber}`,
      detail: "Just now · Unscheduled",
      label: "New",
    };
    setTasks((tasks) => [...tasks, nextTask]);
    setSelectedId(nextTask.id);
    onActivity(`Added a task to ${title} by ${source}.`);
  };

  const archiveTask = (source: string) => {
    if (!selectedTask) {
      onActivity(`${title} has no task to archive.`);
      return;
    }
    setTasks((tasks) => tasks.filter((task) => task.id !== selectedTask.id));
    setSelectedId(null);
    onActivity(`Archived “${selectedTask.title}” from ${title} by ${source}.`);
  };

  return (
    <ShortcutScope
      ref={scopeRef}
      aria-labelledby={`${id}-heading`}
      className={`ns-lane ns-lane-${id}`}
      onFocusCapture={() => onActivity(`${title} shortcuts are active.`)}
      role="region"
      tabIndex={0}
    >
      <LaneCommands archiveTask={archiveTask} id={id} />
      <div className="ns-lane-heading">
        <div>
          <p className="ns-eyebrow">{eyebrow}</p>
          <div className="ns-title-row">
            <h2 id={`${id}-heading`}>{title}</h2>
            <span className="ns-count">{tasks.length}</span>
          </div>
        </div>
        <MenuProvider>
          <MenuButton
            aria-label={`${title} lane actions`}
            className="ns-icon-button"
          >
            <Icon name="dots" />
          </MenuButton>
          <Menu className="ns-menu" gutter={8} portal>
            <MenuItem
              className="ns-menu-item"
              onClick={() => {
                if (selectedTask) {
                  onQuickEdit(title, selectedTask);
                }
              }}
            >
              <span>Quick edit {title} task</span>
              <span className="ns-menu-meta">Selected card</span>
            </MenuItem>
            <MenuItem
              className="ns-menu-item ns-menu-danger"
              onClick={() => archiveTask("menu")}
            >
              <span>Archive selected {title} task</span>
              <Icon name="archive" />
            </MenuItem>
          </Menu>
        </MenuProvider>
      </div>

      {id === "inbox" ? (
        <QuickCapture onActivity={onActivity} onAddTask={addTask} />
      ) : null}

      <div className="ns-task-list">
        {tasks.map((task) => (
          <button
            key={task.id}
            aria-pressed={selectedTask?.id === task.id}
            className="ns-task"
            onClick={() => setSelectedId(task.id)}
            type="button"
          >
            <span className="ns-task-marker" />
            <span className="ns-task-copy">
              <strong>{task.title}</strong>
              <span>{task.detail}</span>
            </span>
            <span className="ns-label">{task.label}</span>
          </button>
        ))}
        {!tasks.length ? (
          <div className="ns-empty">
            <Icon name="spark" />
            <strong>Clear skies</strong>
            <span>Add a task when something lands.</span>
          </div>
        ) : null}
      </div>

      <div className="ns-lane-footer">
        <ShortcutCommand
          className="ns-add-button"
          command={`${id}-new`}
          keys="N"
          onTrigger={(event) => addTask(event.source)}
        >
          <Icon name="plus" />
          New task
        </ShortcutCommand>
        <div
          aria-label={`${title} shortcuts`}
          className="ns-lane-hints"
          role="group"
        >
          <span>
            New
            <Shortcut
              className="ns-shortcut ns-scope-shortcut"
              command={`${id}-new`}
            />
          </span>
          <span>
            Archive
            <Shortcut
              className="ns-shortcut ns-scope-shortcut"
              command={`${id}-archive`}
            />
          </span>
        </div>
      </div>
    </ShortcutScope>
  );
}

function QuickEditDialog({
  task,
  lane,
  onClose,
  onInnerSave,
  workspaceSaves,
}: QuickEditDialogProps) {
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);
  const [innerSaves, setInnerSaves] = useState(0);

  const saveEdit = () => {
    setInnerSaves((count) => count + 1);
    onInnerSave();
  };

  return (
    <Dialog
      backdrop={<div className="ns-backdrop" />}
      className="ns-dialog"
      onClose={onClose}
      open={!!task}
      portal
    >
      <ShortcutProvider enabled={shortcutsEnabled}>
        <div className="ns-dialog-kicker">{lane} · Quick edit</div>
        <DialogHeading className="ns-dialog-heading">
          Tune the task
        </DialogHeading>
        <DialogDescription className="ns-dialog-description">
          The nested shortcut provider owns save while it is enabled.
        </DialogDescription>
        <label className="ns-field">
          <span>Task title</span>
          <input autoFocus defaultValue={task?.title} />
        </label>
        <label className="ns-toggle">
          <input
            checked={shortcutsEnabled}
            onChange={(event) =>
              setShortcutsEnabled(event.currentTarget.checked)
            }
            type="checkbox"
          />
          <span>
            <strong>Use dialog shortcuts</strong>
            <small>Turn this off to let the workspace handle save.</small>
          </span>
        </label>
        <div className="ns-dialog-statuses">
          <p
            aria-label="Quick edit saves"
            className="ns-dialog-status"
            role="status"
          >
            Quick edit saves: {innerSaves}
          </p>
          <p
            aria-label="Workspace saves"
            className="ns-dialog-status"
            role="status"
          >
            {workspaceSaves} Workspace saves
          </p>
        </div>
        <div className="ns-dialog-actions">
          <DialogDismiss className="ns-secondary-button">Close</DialogDismiss>
          <ShortcutCommand
            className="ns-primary-button"
            command="quick-edit-save"
            enabledInTextbox
            keys="mod+S"
            onTrigger={saveEdit}
            preventDefault
          >
            Save task
            <Shortcut className="ns-shortcut" />
          </ShortcutCommand>
        </div>
      </ShortcutProvider>
    </Dialog>
  );
}

export default function Example() {
  const shortcut = useShortcutStore();
  // The React store exposes this stable bound hook for state subscriptions.
  // oxlint-disable-next-line react/hooks
  const shortcutsEnabled = shortcut.useState("enabled");
  const inboxRef = useRef<HTMLDivElement>(null);
  const weekRef = useRef<HTMLDivElement>(null);
  const boardScope = useMemo(() => [inboxRef, weekRef], []);
  const [activity, setActivity] = useState(
    "Focus a lane to activate its shortcuts.",
  );
  const [reviewCount, setReviewCount] = useState(0);
  const [workspaceSaves, setWorkspaceSaves] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [editLane, setEditLane] = useState("");

  const startReview = () => {
    setReviewCount((count) => count + 1);
    setActivity("Started a review for the active lane.");
  };

  return (
    <ShortcutProvider store={shortcut}>
      <WorkspaceCommandRegistry
        onSave={(source) => {
          setWorkspaceSaves((count) => count + 1);
          setActivity(`Saved the workspace by ${source}.`);
        }}
      />
      <div className="ns-app">
        <header className="ns-header">
          <div className="ns-brand">
            <span className="ns-brand-mark" aria-hidden="true">
              N
            </span>
            <span>
              <strong>Northstar</strong>
              <small>Product workspace</small>
            </span>
          </div>
          <div className="ns-header-actions">
            <span
              className="ns-ready"
              data-enabled={shortcutsEnabled || undefined}
            >
              <span />
              {shortcutsEnabled ? "Shortcuts ready" : "Shortcuts paused"}
            </span>
            <ShortcutCommand
              className="ns-header-button"
              command="workspace-save"
            >
              Save
              <Shortcut className="ns-shortcut" />
            </ShortcutCommand>
            <ShortcutCommand
              className="ns-header-button"
              command="global-help"
              keys="Shift+?"
              onTrigger={() => setHelpOpen((open) => !open)}
              preventDefault
              scope={null}
            >
              Help
              <Shortcut className="ns-shortcut" />
            </ShortcutCommand>
            <span
              aria-label="Signed in as Maya Chen"
              className="ns-avatar"
              role="img"
            >
              MC
            </span>
          </div>
        </header>

        <main className="ns-main">
          <div className="ns-workspace">
            <div className="ns-board-heading">
              <div>
                <p className="ns-eyebrow">Monday, August 24</p>
                <h1>Plan the week</h1>
                <p>Move ideas into focus without leaving the keyboard.</p>
              </div>
              <ShortcutCommand
                className="ns-review-button"
                command="board-review"
                keys="mod+Enter"
                onTrigger={startReview}
                preventDefault
                scope={boardScope}
              >
                <span className="ns-review-icon">
                  <Icon name="spark" />
                </span>
                Start review
                <Shortcut className="ns-shortcut" />
              </ShortcutCommand>
            </div>

            <p aria-label="Activity" className="ns-activity" role="status">
              <span>Activity</span>
              {activity}
            </p>
            <div className="ns-board">
              <Lane
                eyebrow="Capture"
                id="inbox"
                onActivity={setActivity}
                onQuickEdit={(lane, task) => {
                  setEditLane(lane);
                  setEditTask(task);
                }}
                scopeRef={inboxRef}
                tasks={inboxTasks}
                title="Inbox"
              />
              <Lane
                eyebrow="Commit"
                id="week"
                onActivity={setActivity}
                onQuickEdit={(lane, task) => {
                  setEditLane(lane);
                  setEditTask(task);
                }}
                scopeRef={weekRef}
                tasks={weekTasks}
                title="This week"
              />
            </div>
          </div>

          <aside className="ns-cheatsheet" aria-labelledby="shortcut-heading">
            <div className="ns-cheatsheet-heading">
              <span className="ns-spark-icon">
                <Icon name="spark" />
              </span>
              <div>
                <p className="ns-eyebrow">Command guide</p>
                <h2 id="shortcut-heading">Keyboard map</h2>
              </div>
            </div>
            <p className="ns-cheatsheet-copy">
              Lane shortcuts follow focus. Global commands work everywhere.
            </p>
            <dl className="ns-command-list">
              <div>
                <dt>New inbox task</dt>
                <dd>
                  <Shortcut
                    alwaysVisible
                    className="ns-shortcut"
                    command="inbox-new"
                  />
                </dd>
              </div>
              <div>
                <dt>Archive inbox task</dt>
                <dd>
                  <Shortcut
                    alwaysVisible
                    className="ns-shortcut"
                    command="inbox-archive"
                  />
                </dd>
              </div>
              <div>
                <dt>Review focused lane</dt>
                <dd>
                  <Shortcut
                    alwaysVisible
                    className="ns-shortcut"
                    command="board-review"
                  />
                </dd>
              </div>
              <div>
                <dt>Save workspace</dt>
                <dd>
                  <Shortcut
                    alwaysVisible
                    className="ns-shortcut"
                    command="workspace-save"
                  />
                </dd>
              </div>
            </dl>
            <div className="ns-tip" data-open={helpOpen || undefined}>
              <strong>
                {helpOpen ? "Help is open" : "A small superpower"}
              </strong>
              <span>
                {helpOpen
                  ? "Focus either lane. Its quiet key hints become active."
                  : "Open a lane menu and its shortcuts still know their owner."}
              </span>
            </div>
            <div className="ns-metrics">
              <output aria-label="Reviews">
                <strong>{reviewCount}</strong>
                Reviews
              </output>
              <output aria-label="Workspace saves">
                <strong>{workspaceSaves}</strong>
                Workspace saves
              </output>
            </div>
          </aside>
        </main>

        <QuickEditDialog
          lane={editLane}
          onClose={() => setEditTask(null)}
          onInnerSave={() => setActivity("Saved the quick edit in the dialog.")}
          task={editTask}
          workspaceSaves={workspaceSaves}
        />
      </div>
    </ShortcutProvider>
  );
}
