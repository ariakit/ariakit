// @vitest-environment happy-dom
import { Dialog } from "@ariakit/react-components/dialog/dialog";
import { DialogDescription } from "@ariakit/react-components/dialog/dialog-description";
import { DialogDismiss } from "@ariakit/react-components/dialog/dialog-dismiss";
import { DialogHeading } from "@ariakit/react-components/dialog/dialog-heading";
import { act, createElement } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { bench } from "vitest";

declare global {
  // oxlint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The dialog schedules work with requestAnimationFrame (for example, the enter
// transition detection in the disclosure content). happy-dom implements rAF
// with timers, which would leave that work pending across benchmark
// iterations. Replace it with a microtask-based version so every open/close
// cycle runs the full lifecycle deterministically within `act`. Callbacks
// scheduled in the same "frame" are flushed together, matching browser frame
// semantics, and callbacks scheduled while flushing land on the next frame.
let nextRafHandle = 1;
let rafFlushScheduled = false;
const rafCallbacks = new Map<number, FrameRequestCallback>();

globalThis.requestAnimationFrame = (callback: FrameRequestCallback) => {
  const handle = nextRafHandle++;
  rafCallbacks.set(handle, callback);
  if (!rafFlushScheduled) {
    rafFlushScheduled = true;
    queueMicrotask(() => {
      rafFlushScheduled = false;
      const frame = [...rafCallbacks.keys()];
      const timestamp = performance.now();
      for (const scheduledHandle of frame) {
        const scheduled = rafCallbacks.get(scheduledHandle);
        // Skip callbacks canceled while this frame was flushing.
        if (!scheduled) continue;
        rafCallbacks.delete(scheduledHandle);
        scheduled(timestamp);
      }
    });
  }
  return handle;
};

globalThis.cancelAnimationFrame = (handle: number) => {
  rafCallbacks.delete(handle);
};

// Body-level siblings outside the React app, like the portal containers,
// banners, and extension nodes found in real pages. The dialog walks these
// when marking and disabling the tree outside the modal.
for (let index = 0; index < 20; index++) {
  const sibling = document.createElement("div");
  const button = document.createElement("button");
  button.textContent = `Sibling button ${index}`;
  sibling.appendChild(button);
  document.body.appendChild(sibling);
}

// Module-level constant so re-renders of the app bail out of re-rendering the
// page content, keeping the measurements focused on the dialog.
const pageContent = createElement(
  "ul",
  { id: "page-content" },
  Array.from({ length: 50 }, (_, index) =>
    createElement(
      "li",
      { key: index },
      createElement("button", null, `Action ${index}`),
    ),
  ),
);

const fields = [
  "Name",
  "Email",
  "Username",
  "Company",
  "Role",
  "Location",
  "Website",
  "Bio",
];

function renderDialogContent(): ReactNode[] {
  return [
    createElement(DialogHeading, { key: "heading" }, "Settings"),
    createElement(
      DialogDescription,
      { key: "description" },
      "Update your profile information.",
    ),
    createElement(
      "form",
      { key: "form" },
      fields.map((field) =>
        createElement(
          "label",
          { key: field },
          field,
          createElement("input", { name: field.toLowerCase() }),
        ),
      ),
      createElement(DialogDismiss, { key: "cancel" }, "Cancel"),
      createElement("button", { key: "save", type: "button" }, "Save"),
    ),
  ];
}

interface AppProps {
  open: boolean;
  modal?: boolean;
  unmountOnHide?: boolean;
}

function App({ open, modal = true, unmountOnHide = true }: AppProps) {
  return createElement(
    "div",
    null,
    createElement("button", { className: "trigger" }, "Open dialog"),
    pageContent,
    createElement(
      Dialog,
      { open, modal, unmountOnHide },
      ...renderDialogContent(),
    ),
  );
}

interface HarnessProps {
  modal?: boolean;
  unmountOnHide?: boolean;
}

async function createHarness(props: HarnessProps = {}) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = async (open: boolean) => {
    await act(async () => {
      root.render(createElement(App, { ...props, open }));
    });
  };
  await render(false);
  const trigger = container.querySelector<HTMLButtonElement>(".trigger");
  if (!trigger) throw new Error("Missing trigger button");
  return { container, root, render, trigger };
}

const modalHarness = await createHarness();
const nonModalHarness = await createHarness({ modal: false });
const reRenderHarness = await createHarness();
let reRenderHarnessOpen = false;

// CI compares these benchmarks across paired baseline/current rounds with a
// ±10% significance gate (see `ariakit perf-compare --node`). The 1500/400ms
// budget mirrors `store.bench.ts`; validate run-to-run noise on the CI results
// before treating deltas on these benchmarks as authoritative.
const options = {
  time: 1500,
  warmupTime: 400,
};

bench(
  "open and close modal dialog",
  async () => {
    modalHarness.trigger.focus();
    await modalHarness.render(true);
    await modalHarness.render(false);
  },
  options,
);

bench(
  "open and close non-modal dialog",
  async () => {
    nonModalHarness.trigger.focus();
    await nonModalHarness.render(true);
    await nonModalHarness.render(false);
  },
  options,
);

bench(
  "mount and unmount closed dialog",
  async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(createElement(App, { open: false, unmountOnHide: false }));
    });
    await act(async () => {
      root.unmount();
    });
    container.remove();
  },
  options,
);

// Keep this benchmark last: it opens its dialog on the first iteration and
// keeps it open, which would otherwise mark and disable the other harnesses'
// trees while their benchmarks run.
bench(
  "re-render open modal dialog",
  async () => {
    if (!reRenderHarnessOpen) {
      reRenderHarnessOpen = true;
      reRenderHarness.trigger.focus();
      await reRenderHarness.render(true);
    }
    await reRenderHarness.render(true);
  },
  options,
);
