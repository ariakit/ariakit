import { isElement } from "@ariakit/utils";

function getFrameWindows(scope: Window) {
  const windows: Window[] = [];

  const collect = (win: Window) => {
    try {
      if (!win.document) return;
      windows.push(win);
      for (const frame of Array.from(win.frames)) {
        collect(frame);
      }
    } catch {}
  };

  collect(scope);
  return windows;
}

function hasFrame(nodes: NodeList) {
  for (const node of Array.from(nodes)) {
    if (!isElement(node)) continue;
    if (node.tagName === "IFRAME") return true;
    if (node.querySelector("iframe")) return true;
  }
  return false;
}

function hasFrameMutation(records: MutationRecord[]) {
  return records.some(
    (record) => hasFrame(record.addedNodes) || hasFrame(record.removedNodes),
  );
}

export function observeFrameTree(scope: Window, listener: () => void) {
  let cleanups: Array<() => void> = [];
  let disposed = false;

  const disconnect = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    cleanups = [];
  };

  const refresh = (notify = false) => {
    disconnect();
    if (disposed) return;

    const onChange = () => refresh(true);

    for (const win of getFrameWindows(scope)) {
      const doc = win.document;
      const view = doc.defaultView;
      if (!view) continue;
      const observer = new view.MutationObserver((records) => {
        if (!hasFrameMutation(records)) return;
        onChange();
      });
      const onLoad = (event: Event) => {
        if (!isElement(event.target)) return;
        if (event.target.tagName !== "IFRAME") return;
        onChange();
      };
      observer.observe(doc, { childList: true, subtree: true });
      doc.addEventListener("load", onLoad, true);
      cleanups.push(() => {
        observer.disconnect();
        doc.removeEventListener("load", onLoad, true);
      });
    }

    if (notify) {
      listener();
    }
  };

  refresh();

  return () => {
    disposed = true;
    disconnect();
  };
}

export function addGlobalWindowFocusListener(
  listener: (event: FocusEvent, eventWindow: Window) => void,
  scope: Window,
) {
  const cleanups: Array<() => void> = [];

  for (const win of getFrameWindows(scope)) {
    const onFocus = (event: FocusEvent) => listener(event, win);
    try {
      win.addEventListener("focus", onFocus, true);
    } catch {
      continue;
    }
    cleanups.push(() => {
      try {
        win.removeEventListener("focus", onFocus, true);
      } catch {}
    });
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}
