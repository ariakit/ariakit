import type { NotificationStoreItem } from "@ariakit/components/notification/notification-store";
import { Notification } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import { NotificationItems } from "@ariakit/react-components/notification/notification-items";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Icon } from "#app/icons/icon.react.tsx";
import type {
  InboxNotificationData,
  InboxNotificationTone,
} from "./notifications.ts";
import { inboxNotifications } from "./notifications.ts";

interface MailMessage {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  accent: string;
}

const initialMessages: MailMessage[] = [
  {
    id: "maya-design",
    sender: "Maya Chen",
    initials: "MC",
    subject: "Design review notes",
    preview: "I added the empty states and the final mobile screens.",
    time: "09:42",
    unread: true,
    accent: "bg-violet-500",
  },
  {
    id: "noah-launch",
    sender: "Noah Williams",
    initials: "NW",
    subject: "Launch checklist",
    preview: "Everything is ready for Thursday. One item needs your review.",
    time: "08:18",
    unread: true,
    accent: "bg-sky-500",
  },
  {
    id: "elena-retreat",
    sender: "Elena Rossi",
    initials: "ER",
    subject: "Team retreat photos",
    preview: "The shared album is ready. Thanks for a brilliant weekend!",
    time: "Yesterday",
    accent: "bg-amber-500",
  },
  {
    id: "atlas-receipt",
    sender: "Atlas Billing",
    initials: "AB",
    subject: "Your August receipt",
    preview: "Your receipt is attached and available in the billing portal.",
    time: "Yesterday",
    accent: "bg-emerald-500",
  },
];

const incomingMessages = [
  {
    sender: "Priya Shah",
    initials: "PS",
    subject: "A small copy update",
    preview: "I tightened the onboarding copy and left two questions for you.",
    accent: "bg-fuchsia-500",
  },
  {
    sender: "Mateo Silva",
    initials: "MS",
    subject: "Coffee next week?",
    preview: "I will be in Madrid on Tuesday. Are you free in the afternoon?",
    accent: "bg-orange-500",
  },
  {
    sender: "Keiko Tanaka",
    initials: "KT",
    subject: "Research summary",
    preview: "The interviews are complete. The strongest theme surprised me.",
    accent: "bg-teal-500",
  },
];

const toneClassNames: Record<InboxNotificationTone, string> = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

interface InboxNotificationCardProps {
  item: NotificationStoreItem<InboxNotificationData>;
}

function InboxNotificationCard({ item }: InboxNotificationCardProps) {
  const tone = item.data?.tone ?? "info";
  const actionLabel = item.data?.actionLabel;
  const onAction = item.data?.onAction;

  return (
    <Notification
      item={item}
      className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 overflow-hidden ak-frame ak-frame-card/4 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-xl shadow-black/10 transition-[transform,opacity] duration-200 [transform:translate(var(--notification-swipe-x,0px),var(--notification-swipe-y,0px))] data-swiping:transition-none ak-dark:shadow-black/35"
    >
      <span
        aria-hidden
        className={`mt-1 size-2.5 rounded-full ${toneClassNames[tone]}`}
      />
      <div className="min-w-0">
        {item.heading && (
          <NotificationHeading className="truncate font-semibold tracking-tight" />
        )}
        {tone === "warning" ? (
          <NotificationMessage className="mt-0.5 text-sm ak-ink-2">
            <strong>3 messages</strong> moved to Trash.
          </NotificationMessage>
        ) : (
          <NotificationMessage className="mt-0.5 text-sm ak-ink-2" />
        )}
        {actionLabel && onAction && (
          <button
            className="mt-3 ak-button ak-layer ak-layer-primary text-sm"
            onClick={() => {
              onAction();
              inboxNotifications.remove(item.id);
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

interface NotificationStackProps {
  regionRef: RefObject<HTMLDivElement | null>;
}

function NotificationStack({ regionRef }: NotificationStackProps) {
  return (
    <NotificationRegion
      ref={regionRef}
      store={inboxNotifications}
      aria-label="Notifications"
      className="fixed inset-x-3 bottom-3 z-50 ms-auto w-auto sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-96"
    >
      <div className="mb-2 flex items-center justify-between px-1 text-xs font-medium ak-ink-2">
        <span>Notifications</span>
        <span className="flex items-center gap-2">
          <kbd className="ak-kbd">Alt T</kbd>
          <button
            className="rounded px-1.5 py-1 hover:ak-layer hover:ak-layer-mix-10"
            onClick={() => inboxNotifications.clear()}
          >
            Clear all
          </button>
        </span>
      </div>
      <NotificationList
        store={inboxNotifications}
        limit={3}
        className="grid gap-2"
      >
        {(items) =>
          items.map((item) => (
            <NotificationListItem key={item.id}>
              <InboxNotificationCard item={item} />
            </NotificationListItem>
          ))
        }
      </NotificationList>
    </NotificationRegion>
  );
}

function useRegionHotkey(regionRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;
      if (event.key.toLowerCase() !== "t") return;
      const region = regionRef.current;
      if (!region || region.hidden) return;
      event.preventDefault();
      region.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [regionRef]);
}

interface SidebarProps {
  count: number;
}

function Sidebar({ count }: SidebarProps) {
  return (
    <aside className="hidden border-e border-black/8 p-4 md:flex md:flex-col ak-dark:border-white/10">
      <div className="flex items-center gap-2 px-2 py-3">
        <span className="grid size-9 place-items-center rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20">
          P
        </span>
        <span className="font-semibold tracking-tight">Postline</span>
      </div>
      <button className="mt-5 ak-button ak-layer ak-layer-primary">
        <span aria-hidden className="text-lg">
          +
        </span>
        New message
      </button>
      <nav aria-label="Mailbox" className="mt-6 grid gap-1 text-sm">
        <a
          aria-label={`Inbox, ${count} ${
            count === 1 ? "conversation" : "conversations"
          }`}
          className="ak-button justify-start ak-layer ak-layer-mix-10"
          href="#inbox"
        >
          <span aria-hidden>✦</span> Inbox
          <span
            aria-hidden
            className="ms-auto ak-badge ak-layer ak-layer-primary"
          >
            {count}
          </span>
        </a>
        <a className="ak-button justify-start" href="#starred">
          <span aria-hidden>☆</span> Starred
        </a>
        <a className="ak-button justify-start" href="#sent">
          <span aria-hidden>↗</span> Sent
        </a>
        <a className="ak-button justify-start" href="#drafts">
          <span aria-hidden>▤</span> Drafts
        </a>
      </nav>
      <div className="mt-auto ak-frame ak-frame-card/4 ak-layer ak-layer-mix-5 text-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium">Storage</span>
          <span className="ak-ink-2">68%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full ak-layer ak-layer-mix-15">
          <div className="h-full w-[68%] rounded-full bg-blue-500" />
        </div>
        <p className="mt-2 text-xs ak-ink-2">10.2 GB of 15 GB used</p>
      </div>
    </aside>
  );
}

interface MessageListProps {
  count: number;
  messages: MailMessage[];
  selectedId: string;
  onSelect: (id: string) => void;
}

function MessageList({
  count,
  messages,
  selectedId,
  onSelect,
}: MessageListProps) {
  return (
    <section id="inbox" aria-labelledby="inbox-heading" className="min-w-0">
      <div className="flex items-center justify-between border-b border-black/8 px-4 py-4 sm:px-6 ak-dark:border-white/10">
        <div>
          <h1
            id="inbox-heading"
            className="text-xl font-semibold tracking-tight"
          >
            Inbox
          </h1>
          <p className="mt-0.5 text-xs ak-ink-2">
            {count} {count === 1 ? "conversation" : "conversations"}
          </p>
        </div>
        <button
          className="ak-button ak-button-square"
          aria-label="Inbox options"
        >
          <span aria-hidden>•••</span>
        </button>
      </div>
      <div className="divide-y divide-black/8 ak-dark:divide-white/10">
        {messages.map((message) => (
          <button
            key={message.id}
            className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-4 text-start transition sm:px-6 ${
              selectedId === message.id
                ? "ak-layer ak-layer-mix-10"
                : "hover:ak-layer hover:ak-layer-mix-5"
            }`}
            onClick={() => onSelect(message.id)}
          >
            <span
              aria-hidden
              className={`grid size-10 place-items-center rounded-full text-xs font-semibold text-white ${message.accent}`}
            >
              {message.initials}
            </span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-2">
                <span
                  className={message.unread ? "font-semibold" : "font-medium"}
                >
                  {message.sender}
                </span>
                {message.unread && (
                  <span
                    className="size-1.5 rounded-full bg-blue-500"
                    aria-label="Unread"
                  />
                )}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium">
                {message.subject}
              </span>
              <span className="mt-1 block truncate text-sm ak-ink-2">
                {message.preview}
              </span>
            </span>
            <span className="text-xs ak-ink-2">{message.time}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface ReadingPaneProps {
  message?: MailMessage;
  onSaveDraft: () => void;
  onDelete: () => void;
  onReceive: () => void;
  onError: () => void;
}

function ReadingPane({
  message,
  onSaveDraft,
  onDelete,
  onReceive,
  onError,
}: ReadingPaneProps) {
  if (!message) {
    return (
      <section className="hidden place-items-center p-8 text-center lg:grid">
        <div>
          <p className="font-medium">Inbox zero</p>
          <p className="mt-1 text-sm ak-ink-2">
            There are no messages to read.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="hidden min-w-0 border-s border-black/8 lg:block ak-dark:border-white/10">
      <div className="flex flex-wrap items-center gap-2 border-b border-black/8 px-7 py-4 ak-dark:border-white/10">
        <button className="ak-button-classic" onClick={onSaveDraft}>
          Save draft
        </button>
        <button className="ak-button-classic" onClick={onReceive}>
          Receive message
        </button>
        <button className="ak-button-classic" onClick={onError}>
          Simulate error
        </button>
        <button className="ms-auto ak-button-classic" onClick={onDelete}>
          Move to Trash
        </button>
      </div>
      <article className="mx-auto max-w-3xl px-8 py-10">
        <div className="flex items-start gap-4">
          <span
            aria-hidden
            className={`grid size-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${message.accent}`}
          >
            {message.initials}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {message.subject}
            </h2>
            <p className="mt-2 text-sm ak-ink-2">
              From{" "}
              <strong className="font-medium ak-ink-0">{message.sender}</strong>
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-5 text-[15px] leading-7 ak-ink-1">
          <p>Hi there,</p>
          <p>{message.preview}</p>
          <p>
            The latest pass is in the shared workspace. I kept the interaction
            simple and made the important actions easier to discover on small
            screens.
          </p>
          <p>
            Let me know what you think,
            <br />
            {message.sender.split(" ")[0]}
          </p>
        </div>
      </article>
    </section>
  );
}

export default function Example() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedId, setSelectedId] = useState(initialMessages[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const receivedCountRef = useRef(0);
  const regionRef = useRef<HTMLDivElement>(null);
  useRegionHotkey(regionRef);

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter((message) =>
      `${message.sender} ${message.subject} ${message.preview}`
        .toLowerCase()
        .includes(query),
    );
  }, [messages, search]);

  const selectedMessage = messages.find((message) => message.id === selectedId);

  const saveDraft = () => {
    inboxNotifications.push("Draft saved.");
  };

  const deleteConversation = () => {
    if (!selectedMessage) return;
    const remainingMessages = messages.filter(
      (message) => message.id !== selectedMessage.id,
    );
    setMessages(remainingMessages);
    setSelectedId(remainingMessages[0]?.id ?? "");
    inboxNotifications.push({
      id: `trash-${selectedMessage.id}`,
      heading: "Conversation moved to Trash",
      message: "3 messages moved to Trash.",
      timeout: null,
      data: {
        tone: "warning",
        actionLabel: "Undo",
        onAction: () => {
          setMessages((currentMessages) => {
            const restored = currentMessages.some(
              (message) => message.id === selectedMessage.id,
            );
            if (restored) return currentMessages;
            return [selectedMessage, ...currentMessages];
          });
          setSelectedId(selectedMessage.id);
        },
      },
    });
  };

  const receiveMessage = () => {
    const count = receivedCountRef.current++;
    const template = incomingMessages[count % incomingMessages.length];
    if (!template) return;
    const message: MailMessage = {
      ...template,
      id: `incoming-${count + 1}`,
      time: "Now",
      unread: true,
    };
    setMessages((currentMessages) => [message, ...currentMessages]);
    inboxNotifications.push({
      id: message.id,
      heading: `New message from ${message.sender}`,
      message: message.preview,
      data: {
        tone: "info",
        actionLabel: "Open message",
        onAction: () => setSelectedId(message.id),
      },
    });
  };

  const simulateError = () => {
    inboxNotifications.push({
      heading: "Message not sent",
      message: "Postline could not reach the mail server.",
      priority: "assertive",
      timeout: null,
      data: {
        tone: "danger",
        actionLabel: "Try again",
        onAction: () => {
          inboxNotifications.push({
            heading: "Message sent",
            message: "Your message is on its way.",
            data: { tone: "success" },
          });
        },
      },
    });
  };

  return (
    <>
      <div className="min-h-dvh bg-[radial-gradient(circle_at_top_left,oklch(96%_0.035_250),transparent_35%),radial-gradient(circle_at_bottom_right,oklch(97%_0.03_330),transparent_32%)] p-2 sm:p-4 ak-dark:bg-[radial-gradient(circle_at_top_left,oklch(24%_0.04_250),transparent_36%),radial-gradient(circle_at_bottom_right,oklch(21%_0.035_330),transparent_32%)]">
        <main className="mx-auto grid min-h-[calc(100dvh-1rem)] max-w-7xl overflow-hidden ak-frame ak-frame-card/2 ak-frame-p-0 ak-layer ak-layer-lighten-6 ak-frame-bordering shadow-2xl shadow-black/10 md:grid-cols-[15rem_minmax(20rem,0.85fr)_minmax(28rem,1.15fr)] sm:min-h-[calc(100dvh-2rem)] ak-dark:shadow-black/30">
          <Sidebar count={messages.length} />
          <div className="min-w-0">
            <header className="flex items-center gap-3 border-b border-black/8 px-4 py-3 sm:px-6 ak-dark:border-white/10">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search mail</span>
                <Icon
                  name="search"
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 ak-ink-2"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full ak-input ps-10"
                  placeholder="Search mail"
                />
              </label>
              <button
                className="relative ak-button ak-button-square"
                aria-label="Notifications"
              >
                <Icon name="info" />
                <NotificationItems store={inboxNotifications}>
                  {(items) =>
                    items.length ? (
                      <span className="absolute -end-1 -top-1 min-w-5 rounded-full bg-blue-600 px-1 text-center text-[10px] font-semibold leading-5 text-white">
                        {items.length}
                      </span>
                    ) : null
                  }
                </NotificationItems>
              </button>
              <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white ak-dark:bg-white ak-dark:text-slate-900">
                DH
              </span>
            </header>
            <MessageList
              count={messages.length}
              messages={visibleMessages}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <ReadingPane
            message={selectedMessage}
            onSaveDraft={saveDraft}
            onDelete={deleteConversation}
            onReceive={receiveMessage}
            onError={simulateError}
          />
        </main>
      </div>
      <NotificationStack regionRef={regionRef} />
    </>
  );
}
