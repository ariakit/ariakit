import type { NotificationStoreItem } from "@ariakit/components/notification/notification-store";
import { Notification } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import { NotificationItems } from "@ariakit/react-components/notification/notification-items";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationProvider } from "@ariakit/react-components/notification/notification-provider";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";
import { useNotificationStore } from "@ariakit/react-components/notification/notification-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "#app/icons/icon.react.tsx";

type UploadTone = "info" | "progress" | "success" | "warning" | "danger";

interface UploadNotificationData {
  tone?: UploadTone;
  progress?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface DriveFile {
  id: string;
  name: string;
  kind: string;
  size: string;
  updated: string;
  color: string;
}

interface Transfer {
  id: string;
  name: string;
  complete: number;
  total: number;
  status: "uploading" | "complete";
}

const files: DriveFile[] = [
  {
    id: "brand",
    name: "Brand system",
    kind: "Folder",
    size: "18 items",
    updated: "2 min ago",
    color: "from-violet-500 to-indigo-500",
  },
  {
    id: "research",
    name: "Research notes",
    kind: "Document",
    size: "2.8 MB",
    updated: "Yesterday",
    color: "from-sky-500 to-cyan-500",
  },
  {
    id: "launch",
    name: "Launch film",
    kind: "Video",
    size: "1.4 GB",
    updated: "Yesterday",
    color: "from-rose-500 to-orange-500",
  },
  {
    id: "photos",
    name: "Team photos",
    kind: "Folder",
    size: "126 items",
    updated: "Aug 20",
    color: "from-amber-400 to-orange-500",
  },
  {
    id: "roadmap",
    name: "Product roadmap",
    kind: "Spreadsheet",
    size: "840 KB",
    updated: "Aug 19",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "archive",
    name: "2025 archive",
    kind: "Archive",
    size: "4.2 GB",
    updated: "Aug 3",
    color: "from-slate-500 to-slate-700",
  },
];

const seededNotifications: NotificationStoreItem<UploadNotificationData>[] = [
  {
    id: "resumed-transfers",
    heading: "Transfers restored",
    message: "Two transfers are ready to resume.",
    timeout: 30000,
    createdAt: Date.UTC(2026, 7, 23, 8, 0),
    data: { tone: "info" },
  },
];

const toneClassNames: Record<UploadTone, string> = {
  info: "bg-sky-500",
  progress: "bg-violet-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

function filterFiles(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return files;
  return files.filter((file) =>
    `${file.name} ${file.kind}`.toLowerCase().includes(normalizedQuery),
  );
}

interface UploadNotificationCardProps {
  item: NotificationStoreItem<UploadNotificationData>;
  onRemove: (id: string) => void;
}

function UploadNotificationCard({
  item,
  onRemove,
}: UploadNotificationCardProps) {
  const tone = item.data?.tone ?? "info";
  const progress = item.data?.progress;
  const actionLabel = item.data?.actionLabel;
  const onAction = item.data?.onAction;

  return (
    <Notification
      item={item}
      className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden ak-frame ak-frame-card/4 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-xl shadow-black/10 transition-[transform,opacity] duration-200 [transform:translate(var(--notification-swipe-x,0px),var(--notification-swipe-y,0px))] data-swiping:transition-none ak-dark:shadow-black/35"
    >
      <span
        aria-hidden
        className={`mt-1 size-2.5 rounded-full ${toneClassNames[tone]}`}
      />
      <div className="min-w-0">
        {item.heading && (
          <NotificationHeading className="truncate font-semibold tracking-tight" />
        )}
        <NotificationMessage className="mt-0.5 text-sm ak-ink-2" />
        {progress !== undefined && (
          <div
            aria-hidden
            className="mt-3 h-1.5 overflow-hidden rounded-full ak-layer ak-layer-mix-15"
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {actionLabel && onAction && (
          <button
            className="mt-3 ak-button ak-layer ak-layer-primary text-sm"
            onClick={() => {
              onAction();
              onRemove(item.id);
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
      <NotificationDismiss
        aria-label={`Dismiss ${item.heading || item.message}`}
        className="-me-1 -mt-1 size-8 rounded-full ak-button ak-button-square text-lg ak-ink-2"
      >
        <span aria-hidden>×</span>
      </NotificationDismiss>
    </Notification>
  );
}

interface StorageSidebarProps {
  onDiskFull: () => void;
}

function StorageSidebar({ onDiskFull }: StorageSidebarProps) {
  return (
    <aside className="hidden border-e border-black/8 p-4 md:flex md:flex-col ak-dark:border-white/10">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="grid size-9 place-items-center rounded-xl bg-violet-600 font-bold text-white shadow-lg shadow-violet-600/20">
          N
        </span>
        <span className="font-semibold tracking-tight">Nimbus Drive</span>
      </div>
      <button className="mt-5 ak-button ak-layer ak-layer-primary">
        <span aria-hidden className="text-lg">
          +
        </span>
        New
      </button>
      <nav aria-label="Drive" className="mt-6 grid gap-1 text-sm">
        <a
          className="ak-button justify-start ak-layer ak-layer-mix-10"
          href="#files"
        >
          <Icon name="copy" /> My Drive
        </a>
        <a className="ak-button justify-start" href="#shared">
          <Icon name="group" /> Shared with me
        </a>
        <a className="ak-button justify-start" href="#recent">
          <Icon name="preview" /> Recent
        </a>
        <a className="ak-button justify-start" href="#trash">
          <Icon name="warning" /> Trash
        </a>
      </nav>
      <div className="mt-auto ak-frame ak-frame-card/4 ak-layer ak-layer-mix-5 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium">Storage</span>
          <span className="ak-ink-2">81%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full ak-layer ak-layer-mix-15">
          <div className="h-full w-[81%] rounded-full bg-violet-500" />
        </div>
        <p className="mt-2 text-xs ak-ink-2">12.1 GB of 15 GB used</p>
        <button
          className="mt-3 w-full ak-button-classic text-xs"
          onClick={onDiskFull}
        >
          Test storage warning
        </button>
      </div>
    </aside>
  );
}

interface TransferPanelProps {
  transfer?: Transfer;
  onStart: () => void;
  onAdvance: () => void;
  onBatch: () => void;
}

function TransferPanel({
  transfer,
  onStart,
  onAdvance,
  onBatch,
}: TransferPanelProps) {
  const progress = transfer
    ? Math.round((transfer.complete / transfer.total) * 100)
    : 0;

  return (
    <section className="ak-frame ak-frame-card/5 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] ak-ink-2">
            Transfer demo
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Upload design assets
          </h2>
        </div>
        <span className="ak-badge ak-layer ak-layer-color-violet-500 ak-layer-mix-15">
          {transfer?.status === "complete" ? "Complete" : "Ready"}
        </span>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-black/15 p-4 ak-dark:border-white/15">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-violet-500/15 text-violet-600 ak-dark:text-violet-300">
            <Icon name="arrowUp" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {transfer?.name ?? "design-assets.zip"}
            </p>
            <p className="mt-0.5 text-xs ak-ink-2">
              {transfer
                ? `${transfer.complete} of ${transfer.total} files · ${progress}%`
                : "12 files · 48.2 MB"}
            </p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full ak-layer ak-layer-mix-15">
          <div
            className="h-full rounded-full bg-violet-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="ak-button ak-layer ak-layer-primary"
          onClick={onStart}
        >
          Start upload
        </button>
        <button
          className="ak-button-classic"
          onClick={onAdvance}
          disabled={!transfer || transfer.status === "complete"}
        >
          Advance upload
        </button>
        <button className="ak-button-classic" onClick={onBatch}>
          Queue 10 files
        </button>
      </div>
    </section>
  );
}

interface FileGridProps {
  files: DriveFile[];
}

function FileGrid({ files: visibleFiles }: FileGridProps) {
  return (
    <section id="files" aria-labelledby="files-heading" className="mt-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2
            id="files-heading"
            className="text-lg font-semibold tracking-tight"
          >
            Files
          </h2>
          <p className="mt-1 text-sm ak-ink-2">
            {visibleFiles.length} {visibleFiles.length === 1 ? "item" : "items"}
          </p>
        </div>
        <button className="ak-button-classic text-sm">Last modified</button>
      </div>
      {visibleFiles.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleFiles.map((file) => (
            <button
              key={file.id}
              className="group text-start ak-frame ak-frame-card/4 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                aria-hidden
                className={`grid aspect-[1.65] place-items-center rounded-xl bg-gradient-to-br text-3xl text-white ${file.color}`}
              >
                {file.kind === "Folder" ? "⌘" : file.kind.slice(0, 1)}
              </span>
              <span className="mt-3 block truncate text-sm font-semibold">
                {file.name}
              </span>
              <span className="mt-1 flex items-center justify-between gap-2 text-xs ak-ink-2">
                <span>{file.size}</span>
                <span>{file.updated}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid min-h-48 place-items-center rounded-2xl border border-dashed border-black/15 text-center ak-dark:border-white/15">
          <div>
            <Icon name="search" className="text-2xl ak-ink-2" />
            <p className="mt-2 font-medium">No matching files</p>
            <p className="mt-1 text-sm ak-ink-2">Try a broader search.</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default function Example() {
  const notifications = useNotificationStore<UploadNotificationData>({
    defaultItems: seededNotifications,
    timeout: 12000,
  });
  const [search, setSearch] = useState("");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<
    "all" | "attention"
  >("all");
  const batchCountRef = useRef(0);
  const searchAnnouncementRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      const timer = searchAnnouncementRef.current;
      if (timer === undefined) return;
      window.clearTimeout(timer);
    };
  }, []);

  const visibleFiles = useMemo(() => filterFiles(search), [search]);
  const transfer = transfers.find((item) => item.id === "design-assets");

  const startUpload = () => {
    const nextTransfer: Transfer = {
      id: "design-assets",
      name: "design-assets.zip",
      complete: 0,
      total: 12,
      status: "uploading",
    };
    setTransfers((currentTransfers) => [
      nextTransfer,
      ...currentTransfers.filter((item) => item.id !== nextTransfer.id),
    ]);
    notifications.push({
      id: nextTransfer.id,
      heading: "Uploading design-assets.zip",
      message: "0 of 12 files uploaded.",
      announceMessage: "Upload started.",
      timeout: null,
      data: { tone: "progress", progress: 0 },
    });
  };

  const advanceUpload = () => {
    if (!transfer) return;
    if (transfer.status === "complete") return;
    const complete = Math.min(transfer.complete + 3, transfer.total);
    const finished = complete === transfer.total;
    const nextTransfer: Transfer = {
      ...transfer,
      complete,
      status: finished ? "complete" : "uploading",
    };
    setTransfers((currentTransfers) =>
      currentTransfers.map((item) =>
        item.id === nextTransfer.id ? nextTransfer : item,
      ),
    );
    const progress = Math.round((complete / transfer.total) * 100);
    if (!notifications.item(transfer.id)) {
      notifications.push({
        id: transfer.id,
        heading: finished ? "Upload complete" : "Uploading design-assets.zip",
        message: finished
          ? "12 files uploaded successfully."
          : `${complete} of ${transfer.total} files uploaded.`,
        timeout: finished ? 6000 : null,
        data: { tone: finished ? "success" : "progress", progress },
      });
      return;
    }
    notifications.update(
      transfer.id,
      {
        heading: finished ? "Upload complete" : "Uploading design-assets.zip",
        message: finished
          ? "12 files uploaded successfully."
          : `${complete} of ${transfer.total} files uploaded.`,
        announceMessage:
          complete === 6
            ? "Upload is halfway complete."
            : finished
              ? "Upload complete."
              : undefined,
        timeout: finished ? 6000 : null,
        data: { tone: finished ? "success" : "progress", progress },
      },
      { announce: complete === 6 || finished },
    );
  };

  const queueBatch = () => {
    const batch = ++batchCountRef.current;
    for (let index = 1; index <= 10; index += 1) {
      notifications.push({
        id: `batch-${batch}-${index}`,
        heading: `File ${index} queued`,
        message: `Batch ${batch} is waiting for a transfer slot.`,
        timeout: null,
        data: { tone: "info" },
      });
    }
  };

  const showDiskFull = () => {
    notifications.push({
      heading: "Storage is full",
      message: "Free up 2 GB before this upload can continue.",
      priority: "assertive",
      timeout: null,
      data: {
        tone: "danger",
        actionLabel: "Review files",
        onAction: () => setSearch("archive"),
      },
    });
  };

  const filterNotifications = useCallback(
    (item: NotificationStoreItem<UploadNotificationData>) => {
      if (notificationFilter === "all") return true;
      const tone = item.data?.tone;
      return tone === "danger" || tone === "warning";
    },
    [notificationFilter],
  );

  const updateSearch = (value: string) => {
    setSearch(value);
    const timer = searchAnnouncementRef.current;
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    searchAnnouncementRef.current = window.setTimeout(() => {
      searchAnnouncementRef.current = undefined;
      const resultCount = filterFiles(value).length;
      notifications.announce(
        `${resultCount} ${resultCount === 1 ? "file" : "files"} found.`,
      );
    }, 300);
  };

  return (
    <NotificationProvider store={notifications}>
      <div className="min-h-dvh bg-[radial-gradient(circle_at_top_right,oklch(96%_0.045_300),transparent_38%),radial-gradient(circle_at_bottom_left,oklch(96%_0.035_210),transparent_35%)] p-2 sm:p-4 ak-dark:bg-[radial-gradient(circle_at_top_right,oklch(23%_0.045_300),transparent_38%),radial-gradient(circle_at_bottom_left,oklch(22%_0.035_210),transparent_35%)]">
        <main className="mx-auto grid min-h-[calc(100dvh-1rem)] max-w-7xl overflow-hidden ak-frame ak-frame-card/2 ak-frame-p-0 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-2xl shadow-black/10 md:grid-cols-[15rem_minmax(0,1fr)] sm:min-h-[calc(100dvh-2rem)] ak-dark:shadow-black/30">
          <StorageSidebar onDiskFull={showDiskFull} />
          <div className="min-w-0">
            <header className="flex items-center gap-3 border-b border-black/8 px-4 py-3 sm:px-6 ak-dark:border-white/10">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search files</span>
                <Icon
                  name="search"
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ak-ink-2"
                />
                <input
                  value={search}
                  onChange={(event) => updateSearch(event.target.value)}
                  className="w-full ak-input ps-10"
                  placeholder="Search files"
                />
              </label>
              <button
                className="relative ak-button ak-button-square"
                aria-label="Transfer notifications"
              >
                <Icon name="arrowUp" />
                <NotificationItems store={notifications}>
                  {(items) =>
                    items.length ? (
                      <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-violet-600 px-1 text-center text-[10px] font-semibold leading-5 text-white">
                        {items.length}
                      </span>
                    ) : null
                  }
                </NotificationItems>
              </button>
              <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white ak-dark:bg-white ak-dark:text-slate-900">
                NS
              </span>
            </header>
            <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-violet-600 ak-dark:text-violet-300">
                    Welcome back, Nora
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                    Your workspace
                  </h1>
                </div>
                <p className="max-w-sm text-sm ak-ink-2">
                  Search updates are announced without adding a visual card.
                  Transfer cards keep their identity as progress changes.
                </p>
              </div>
              <TransferPanel
                transfer={transfer}
                onStart={startUpload}
                onAdvance={advanceUpload}
                onBatch={queueBatch}
              />
              <FileGrid files={visibleFiles} />
            </div>
          </div>
        </main>
      </div>

      <NotificationRegion
        store={notifications}
        aria-label="Transfer notifications"
        className="fixed inset-x-3 bottom-3 z-50 ms-auto w-auto sm:inset-x-auto sm:bottom-auto sm:end-5 sm:top-5 sm:w-96"
      >
        <div className="mb-2 flex items-center justify-between gap-3 px-1 text-xs font-medium ak-ink-2">
          <span>Transfer notifications</span>
          <span className="flex items-center rounded-lg ak-layer ak-layer-mix-10 p-0.5">
            <button
              aria-pressed={notificationFilter === "all"}
              className="rounded-md px-2 py-1 aria-pressed:ak-layer aria-pressed:ak-layer-lighten-6"
              onClick={() => setNotificationFilter("all")}
            >
              All
            </button>
            <button
              aria-pressed={notificationFilter === "attention"}
              className="rounded-md px-2 py-1 aria-pressed:ak-layer aria-pressed:ak-layer-lighten-6"
              onClick={() => setNotificationFilter("attention")}
            >
              Attention
            </button>
          </span>
        </div>
        <NotificationList
          store={notifications}
          filter={filterNotifications}
          limit={3}
          className="grid gap-2"
        >
          {(items) =>
            items.map((item) => (
              <NotificationListItem key={item.id}>
                <UploadNotificationCard
                  item={item}
                  onRemove={notifications.remove}
                />
              </NotificationListItem>
            ))
          }
        </NotificationList>
      </NotificationRegion>
    </NotificationProvider>
  );
}
