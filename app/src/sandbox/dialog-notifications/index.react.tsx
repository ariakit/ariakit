import { createNotificationStore } from "@ariakit/components/notification/notification-store";
import {
  Button,
  Dialog,
  DialogDismiss,
  DialogHeading,
  Menu,
  MenuButton,
  MenuItem,
  MenuProvider,
} from "@ariakit/react";
import { Notification } from "@ariakit/react-components/notification/notification";
import { NotificationDismiss } from "@ariakit/react-components/notification/notification-dismiss";
import { NotificationHeading } from "@ariakit/react-components/notification/notification-heading";
import { NotificationList } from "@ariakit/react-components/notification/notification-list";
import { NotificationListItem } from "@ariakit/react-components/notification/notification-list-item";
import { NotificationMessage } from "@ariakit/react-components/notification/notification-message";
import { NotificationProvider } from "@ariakit/react-components/notification/notification-provider";
import { NotificationRegion } from "@ariakit/react-components/notification/notification-region";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.9 18.2a3 3 0 0 1-5.8 0m9.1-2.4H5.8c1.5-1.7 2.1-3.5 2.1-6a4.1 4.1 0 1 1 8.2 0c0 2.5.6 4.3 2.1 6Z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-5-5 5 5-5 5"
      />
    </svg>
  );
}

const shadowLabStyles = `
  :host {
    color-scheme: dark;
    display: block;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  * {
    box-sizing: border-box;
  }

  [hidden] {
    display: none !important;
  }

  button {
    font: inherit;
  }

  .shadow-lab {
    align-items: center;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.09), rgba(139, 92, 246, 0.08));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1.25rem;
    color: #e2e8f0;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }

  .shadow-copy {
    min-width: 0;
  }

  .shadow-eyebrow {
    color: #67e8f9;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    margin: 0 0 0.35rem;
    text-transform: uppercase;
  }

  .shadow-title {
    color: white;
    font-size: 1rem;
    font-weight: 650;
    margin: 0;
  }

  .shadow-description {
    color: #94a3b8;
    font-size: 0.82rem;
    line-height: 1.5;
    margin: 0.25rem 0 0;
  }

  .shadow-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    justify-content: flex-end;
  }

  .shadow-button {
    background: #67e8f9;
    border: 0;
    border-radius: 999px;
    color: #082f49;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 700;
    padding: 0.65rem 0.9rem;
  }

  .shadow-button-secondary {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
  }

  .shadow-backdrop {
    background: rgba(2, 6, 23, 0.78);
    inset: 0;
    position: fixed;
    z-index: 140;
  }

  .shadow-dialog {
    background: #0f172a;
    border: 1px solid rgba(103, 232, 249, 0.18);
    border-radius: 1.35rem;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
    color: #e2e8f0;
    inset: 50% auto auto 50%;
    max-width: calc(100vw - 2rem);
    padding: 1.5rem;
    position: fixed;
    transform: translate(-50%, -50%);
    width: 27rem;
    z-index: 150;
  }

  .shadow-dialog h1 {
    color: white;
    font-size: 1.35rem;
    margin: 0;
  }

  .shadow-dialog p {
    color: #94a3b8;
    line-height: 1.55;
    margin: 0.5rem 0 1.25rem;
  }

  .shadow-dialog-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }

  .shadow-region {
    inset: 1.5rem 1.5rem auto auto;
    position: fixed;
    width: min(22rem, calc(100vw - 3rem));
    z-index: 170;
  }

  .shadow-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .shadow-notification {
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(103, 232, 249, 0.28);
    border-radius: 1rem;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
    color: #e2e8f0;
    outline: none;
    padding: 1rem 3rem 1rem 1rem;
    position: relative;
  }

  .shadow-notification h2 {
    color: white;
    font-size: 1rem;
    margin: 0;
  }

  .shadow-notification p {
    color: #94a3b8;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0.35rem 0 0.85rem;
  }

  .shadow-dismiss {
    background: transparent;
    border: 0;
    border-radius: 999px;
    color: #94a3b8;
    cursor: pointer;
    height: 2rem;
    position: absolute;
    right: 0.65rem;
    top: 0.65rem;
    width: 2rem;
  }

  @media (max-width: 640px) {
    .shadow-lab {
      align-items: stretch;
      flex-direction: column;
    }

    .shadow-actions {
      justify-content: flex-start;
    }
  }
`;

function ShadowRootContent() {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [notifications] = useState(() =>
    createNotificationStore({ timeout: null }),
  );
  const sendButtonRef = useRef<HTMLButtonElement>(null);

  const pushNotification = () => {
    notifications.push({
      id: "shadow-update",
      heading: "Shadow update",
      message: "The exact notification surface remains available.",
      timeout: null,
    });
  };

  return (
    <NotificationProvider store={notifications}>
      <style>{shadowLabStyles}</style>
      <div data-shadow-notification-root>
        <div className="shadow-lab" data-shadow-notification-lab>
          <div className="shadow-copy">
            <p className="shadow-eyebrow">Shadow root isolation</p>
            <p className="shadow-title">One root, one precise exemption.</p>
            <p className="shadow-description">
              The notification stays reachable while unrelated shadow content
              remains behind the modal.
            </p>
          </div>
          <div className="shadow-actions">
            <Button className="shadow-button" onClick={() => setOpen(true)}>
              Open shadow-root lab
            </Button>
            <button
              className="shadow-button shadow-button-secondary"
              data-unrelated-shadow-action
              type="button"
            >
              Unrelated shadow action
            </button>
          </div>
        </div>

        <NotificationRegion
          aria-label="Shadow notifications"
          className="shadow-region"
          finalFocus={sendButtonRef}
        >
          <NotificationList className="shadow-list">
            {(items) =>
              items.map((item) => (
                <NotificationListItem key={item.id}>
                  <Notification className="shadow-notification" item={item}>
                    <NotificationHeading />
                    <NotificationMessage />
                    <button
                      className="shadow-button shadow-button-secondary"
                      type="button"
                      onClick={() => setAcknowledged(true)}
                    >
                      {acknowledged
                        ? "Shadow update acknowledged"
                        : "Acknowledge shadow update"}
                    </button>
                    <NotificationDismiss
                      aria-label="Dismiss Shadow update"
                      className="shadow-dismiss"
                    >
                      <CloseIcon />
                    </NotificationDismiss>
                  </Notification>
                </NotificationListItem>
              ))
            }
          </NotificationList>
        </NotificationRegion>

        <Dialog
          aria-label="Shadow notification lab"
          backdrop={<div className="shadow-backdrop" />}
          className="shadow-dialog"
          open={open}
          portal={false}
          onClose={() => setOpen(false)}
        >
          <DialogHeading>Shadow notification lab</DialogHeading>
          <p>
            Send an update after this modal opens to test the stable region in
            the same shadow root.
          </p>
          <div className="shadow-dialog-actions">
            <Button
              aria-label="Send shadow update"
              className="shadow-button"
              onClick={pushNotification}
              ref={sendButtonRef}
            >
              Send shadow update
            </Button>
            <DialogDismiss className="shadow-button shadow-button-secondary">
              Close shadow modal
            </DialogDismiss>
          </div>
        </Dialog>
      </div>
    </NotificationProvider>
  );
}

function ShadowRootLab() {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const setHost = useCallback((host: HTMLDivElement | null) => {
    if (!host) return;
    setShadowRoot(host.shadowRoot || host.attachShadow({ mode: "open" }));
  }, []);

  return (
    <>
      <div
        className="relative block w-full max-w-4xl"
        data-testid="notification-shadow-host"
        ref={setHost}
      />
      {shadowRoot && createPortal(<ShadowRootContent />, shadowRoot)}
    </>
  );
}

export default function Example() {
  const [open, setOpen] = useState(false);
  const [openedItems, setOpenedItems] = useState(() => new Set<string>());
  const [notifications] = useState(() =>
    createNotificationStore({ timeout: 30_000 }),
  );
  const timedFocusRef = useRef<HTMLButtonElement>(null);

  const pushTimed = () => {
    notifications.push({
      id: "export-ready",
      heading: "Export ready",
      message: "Your accessibility report is ready to review.",
      timeout: 30_000,
    });
  };

  const pushUntimed = () => {
    notifications.push({
      id: "connection-warning",
      heading: "Connection needs attention",
      message: "Review the offline changes before you leave this workspace.",
      timeout: null,
    });
  };

  const openActivity = (id: string) => {
    setOpenedItems((currentItems) => {
      const nextItems = new Set(currentItems);
      nextItems.add(id);
      return nextItems;
    });
  };

  return (
    <NotificationProvider store={notifications}>
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden bg-slate-950 px-5 py-12 text-slate-100">
        <div
          aria-hidden="true"
          className="absolute -left-24 top-12 size-80 rounded-full bg-cyan-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 bottom-0 size-96 rounded-full bg-violet-500/20 blur-3xl"
        />

        <section className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-1 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="rounded-[1.35rem] border border-white/5 bg-slate-950/60 p-6 sm:p-10">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                  <BellIcon />
                  Dialog × Notifications
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                  Updates that stay within reach.
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Open the modal, then send an update. The notification remains
                  announced, interactive, and outside the modal without any
                  persistent-element wiring.
                </p>
              </div>

              <Button
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-200"
                onClick={() => setOpen(true)}
              >
                Open notification lab
                <ArrowIcon />
              </Button>
            </div>

            <div className="mt-10 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">2</div>
                <div className="mt-1 text-sm text-slate-400">
                  Escape behaviors
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">0</div>
                <div className="mt-1 text-sm text-slate-400">
                  App-owned inert exceptions
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.04] p-4">
                <div className="text-2xl font-semibold text-white">1</div>
                <div className="mt-1 text-sm text-slate-400">
                  Stable notification region
                </div>
              </div>
            </div>
          </div>
        </section>

        <ShadowRootLab />

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          backdrop={
            <div className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm" />
          }
          className="fixed inset-x-4 top-1/2 z-50 mx-auto max-h-[calc(100vh-2rem)] max-w-xl -translate-y-1/2 overflow-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-black/60 sm:p-8"
        >
          <div className="mb-6 flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200">
              <BellIcon />
            </div>
            <div>
              <DialogHeading className="text-2xl font-semibold text-white">
                Notification lab
              </DialogHeading>
              <p className="mt-1 leading-6 text-slate-400">
                Send a notification after this modal is already open and empty.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              aria-label="Send timed update"
              className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-left transition hover:bg-emerald-300/15"
              onClick={pushTimed}
              ref={timedFocusRef}
            >
              <span className="block font-semibold text-emerald-100">
                Send timed update
              </span>
              <span className="mt-1 block text-sm leading-5 text-emerald-100/65">
                Escape dismisses the card first.
              </span>
            </Button>
            <Button
              aria-label="Send untimed update"
              className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-left transition hover:bg-amber-300/15"
              onClick={pushUntimed}
            >
              <span className="block font-semibold text-amber-100">
                Send untimed update
              </span>
              <span className="mt-1 block text-sm leading-5 text-amber-100/65">
                Escape closes the modal instead.
              </span>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
            <MenuProvider>
              <MenuButton className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
                Notification options
              </MenuButton>
              <Menu
                aria-label="Notification options"
                gutter={8}
                className="z-[80] min-w-52 rounded-2xl border border-white/10 bg-slate-800 p-1.5 text-sm text-slate-100 shadow-xl shadow-black/40"
              >
                <MenuItem className="cursor-default rounded-xl px-3 py-2 outline-none data-[active-item]:bg-white/10">
                  Keep popup open
                </MenuItem>
                <MenuItem className="cursor-default rounded-xl px-3 py-2 outline-none data-[active-item]:bg-white/10">
                  Review settings
                </MenuItem>
              </Menu>
            </MenuProvider>
            <DialogDismiss className="ml-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
              Close modal
            </DialogDismiss>
          </div>
        </Dialog>
      </main>

      <NotificationRegion
        aria-label="Notifications"
        className="fixed inset-x-4 top-4 z-[100] mx-auto max-w-sm sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[24rem]"
        finalFocus={timedFocusRef}
      >
        <NotificationList className="m-0 flex list-none flex-col gap-3 p-0">
          {(items) =>
            items.map((item) => {
              const untimed = item.timeout === null;
              const activityOpened = openedItems.has(item.id);
              return (
                <NotificationListItem key={item.id} className="list-none">
                  <Notification
                    item={item}
                    className={`relative overflow-hidden rounded-2xl border bg-slate-900/95 p-5 pr-12 text-slate-100 shadow-2xl shadow-black/35 outline-none backdrop-blur-xl transition focus-visible:ring-2 ${
                      untimed
                        ? "border-amber-300/25 focus-visible:ring-amber-300"
                        : "border-emerald-300/25 focus-visible:ring-emerald-300"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className={`absolute inset-y-0 left-0 w-1 ${
                        untimed ? "bg-amber-300" : "bg-emerald-300"
                      }`}
                    />
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
                      <span
                        className={
                          untimed ? "text-amber-200" : "text-emerald-200"
                        }
                      >
                        {untimed ? "Stays until dismissed" : "Timed update"}
                      </span>
                    </div>
                    <NotificationHeading className="text-base font-semibold text-white" />
                    <NotificationMessage className="mt-1 text-sm leading-6 text-slate-300" />
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
                      onClick={() => openActivity(item.id)}
                    >
                      {activityOpened ? "Activity opened" : "Open activity"}
                      <ArrowIcon />
                    </button>
                    <NotificationDismiss
                      aria-label={`Dismiss ${item.heading || item.message}`}
                      className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <CloseIcon />
                    </NotificationDismiss>
                  </Notification>
                </NotificationListItem>
              );
            })
          }
        </NotificationList>
      </NotificationRegion>
    </NotificationProvider>
  );
}
