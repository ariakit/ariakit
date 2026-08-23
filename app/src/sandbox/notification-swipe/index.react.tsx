import type { NotificationStoreItem } from "@ariakit/components/notification/notification-store";
import { Notification } from "@ariakit/react-components/notification/notification";
import type { NotificationSwipeDirection } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import { NotificationItems } from "@ariakit/react-components/notification/notification-items";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";
import { useNotificationStore } from "@ariakit/react-components/notification/notification-store";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import "./style.css";

type Direction = "ltr" | "rtl";
type Policy = "default" | "touch" | "locked";
type Tone = "blue" | "gold" | "green" | "plum" | "rose";

interface DemoNotificationData {
  directions:
    | NotificationSwipeDirection
    | readonly NotificationSwipeDirection[];
  gesture: string;
  policy: Policy;
  tone: Tone;
  undo?: boolean;
}

function createInitialItems(): NotificationStoreItem<DemoNotificationData>[] {
  return [
    {
      id: "logical-end",
      heading: "Logical end",
      message: "A short drag snaps back. A full drag clears the card.",
      timeout: null,
      createdAt: 1,
      data: {
        directions: "end",
        gesture: "end",
        policy: "default",
        tone: "blue",
      },
    },
    {
      id: "vertical-lane",
      heading: "Vertical lane",
      message: "Swipe up or down. Horizontal movement stays in place.",
      timeout: null,
      createdAt: 2,
      data: {
        directions: ["up", "down"],
        gesture: "up · down",
        policy: "default",
        tone: "gold",
      },
    },
    {
      id: "any-direction",
      heading: "Any direction",
      message: "All four directions work. The Undo control stays clickable.",
      timeout: null,
      createdAt: 3,
      data: {
        directions: ["up", "down", "start", "end"],
        gesture: "all",
        policy: "default",
        tone: "green",
        undo: true,
      },
    },
    {
      id: "touch-only",
      heading: "Touch only",
      message: "A callback accepts touch or pen and rejects mouse drags.",
      timeout: null,
      createdAt: 4,
      data: {
        directions: "end",
        gesture: "end",
        policy: "touch",
        tone: "plum",
      },
    },
    {
      id: "swipe-locked",
      heading: "Swipe locked",
      message: "removeOnSwipe is false. Use the close button instead.",
      timeout: null,
      createdAt: 5,
      data: {
        directions: "end",
        gesture: "none",
        policy: "locked",
        tone: "rose",
      },
    },
  ];
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      <path d="m6 6 8 8m0-8-8 8" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18 9a6 6 0 0 0-12 0c0 4-2 5-2 5h16s-2-1-2-5ZM10 18h4" />
    </svg>
  );
}

function getGestureLabel(data: DemoNotificationData, direction: Direction) {
  if (data.gesture === "end") {
    return direction === "rtl" ? "← end" : "end →";
  }
  if (data.gesture === "up · down") return "↑ · ↓";
  if (data.gesture === "all") return "↕ · ↔";
  return "button";
}

interface NotificationCardProps {
  direction: Direction;
  item: NotificationStoreItem<DemoNotificationData>;
  onActivity: (message: string) => void;
}

function NotificationCard({
  direction,
  item,
  onActivity,
}: NotificationCardProps) {
  const data = item.data;
  const removeOnSwipe =
    data.policy === "locked"
      ? false
      : data.policy === "touch"
        ? (event: PointerEvent<HTMLDivElement>) => {
            const allowed = event.pointerType !== "mouse";
            onActivity(
              allowed
                ? "The touch callback accepted the swipe."
                : "The touch callback rejected the mouse drag.",
            );
            return allowed;
          }
        : undefined;

  return (
    <Notification
      item={item}
      dir={direction}
      data-policy={data.policy}
      data-tone={data.tone}
      className="notification-card"
      removeOnSwipe={removeOnSwipe}
      swipeDirection={data.directions}
    >
      <div aria-hidden="true" className="swipe-wash" />
      <div className="card-icon">
        <BellIcon />
      </div>
      <div className="card-copy" dir="ltr">
        <div className="card-meta">
          <span className="policy-chip">
            {data.policy === "touch"
              ? "callback"
              : data.policy === "locked"
                ? "false"
                : "swipe"}
          </span>
          <span aria-hidden="true" className="gesture-chip">
            {getGestureLabel(data, direction)}
          </span>
        </div>
        <NotificationHeading className="card-heading" />
        <NotificationMessage className="card-message" />
        {data.undo && (
          <button
            className="undo-button"
            onClick={() => onActivity("Undo ran without starting a swipe.")}
          >
            Undo archive
          </button>
        )}
      </div>
      <NotificationDismiss
        aria-label={`Dismiss ${item.heading || item.message}`}
        className="dismiss-button"
      >
        <CloseIcon />
      </NotificationDismiss>
    </Notification>
  );
}

export default function Example() {
  const defaultItems = useMemo(() => createInitialItems(), []);
  const store = useNotificationStore<DemoNotificationData>({
    defaultItems,
    timeout: null,
  });
  const resetRef = useRef<HTMLButtonElement>(null);
  const [direction, setDirection] = useState<Direction>("ltr");
  const [activity, setActivity] = useState(
    "Drag a card, or use its close button.",
  );

  const reset = () => {
    store.setItems(createInitialItems());
    setActivity("The five swipe cases are ready again.");
  };

  return (
    <div className="notification-swipe-demo">
      <main className="phone-shell">
        <div aria-hidden="true" className="phone-status">
          <span>9:41</span>
          <span className="status-icons">● ◒ ▰</span>
        </div>

        <header className="app-header">
          <div>
            <p className="kicker">Interaction lab</p>
            <h1>Swipe inbox</h1>
          </div>
          <button ref={resetRef} className="reset-button" onClick={reset}>
            Reset
          </button>
        </header>

        <section className="lab-intro" aria-labelledby="gesture-mode-heading">
          <div>
            <h2 id="gesture-mode-heading">Gesture direction</h2>
            <p>Try short and completed swipes on each card.</p>
          </div>
          <button
            aria-pressed={direction === "rtl"}
            className="direction-button"
            onClick={() => {
              setDirection((value) => (value === "ltr" ? "rtl" : "ltr"));
              setActivity(
                "Logical start and end now follow the new direction.",
              );
            }}
          >
            {direction === "ltr" ? "Use RTL" : "Use LTR"}
          </button>
        </section>

        <section className="notification-tray" aria-label="Swipe practice">
          <div className="tray-heading">
            <span>Active cards</span>
            <NotificationItems store={store}>
              {(items) => (
                <output aria-label="Active notification count">
                  {items.length}
                </output>
              )}
            </NotificationItems>
          </div>

          <NotificationRegion
            store={store}
            finalFocus={resetRef}
            aria-label="Swipe notification stack"
            className="notification-region"
          >
            <NotificationList
              store={store}
              limit={5}
              className="notification-list"
            >
              {(items) =>
                items.map((item) => (
                  <NotificationListItem
                    key={item.id}
                    className="notification-list-item"
                  >
                    <NotificationCard
                      direction={direction}
                      item={item}
                      onActivity={setActivity}
                    />
                  </NotificationListItem>
                ))
              }
            </NotificationList>
          </NotificationRegion>

          <NotificationItems store={store}>
            {(items) =>
              items.length ? null : (
                <div className="empty-state">
                  <span aria-hidden="true">✓</span>
                  <strong>Inbox cleared</strong>
                  <p>Focus returned to Reset.</p>
                </div>
              )
            }
          </NotificationItems>
        </section>

        <footer className="lab-footer">
          <span aria-hidden="true" className="activity-dot" />
          <p>{activity}</p>
        </footer>
      </main>
    </div>
  );
}
