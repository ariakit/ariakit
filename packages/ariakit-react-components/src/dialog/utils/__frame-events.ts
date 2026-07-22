import { isElement } from "@ariakit/utils";

export interface RegisterFrameTreeListener {
  (setup: (scope: Window) => () => void): () => void;
}

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

interface AddFrameTreeEventListenerParams<K extends keyof DocumentEventMap> {
  type: K;
  listener: (event: DocumentEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
  scope: Window;
}

export function addFrameTreeEventListener<K extends keyof DocumentEventMap>({
  type,
  listener,
  options,
  scope,
}: AddFrameTreeEventListenerParams<K>) {
  const cleanups: Array<() => void> = [];

  for (const win of getFrameWindows(scope)) {
    let doc: Document;
    try {
      doc = win.document;
      doc.addEventListener(type, listener, options);
    } catch {
      continue;
    }
    cleanups.push(() => {
      try {
        doc.removeEventListener(type, listener, options);
      } catch {}
    });
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
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

function getFocusedFrameWindow(scope: Window) {
  let win = scope;

  while (true) {
    let activeElement: Element | null;
    try {
      activeElement = win.document.activeElement;
    } catch {
      return win === scope ? null : win;
    }
    if (!isElement(activeElement)) return win === scope ? null : win;
    if (activeElement.tagName !== "IFRAME") {
      return win === scope ? null : win;
    }
    const frameWindow = (activeElement as HTMLIFrameElement).contentWindow;
    if (!frameWindow) return win === scope ? null : win;
    win = frameWindow;
  }
}

export function observeFrameTree(
  scope: Window,
  listener: (scope?: Window) => void,
) {
  let cleanups: Array<() => void> = [];
  let disposed = false;
  let refreshQueued = false;
  const documents = new Set<Document>();

  const disconnect = () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
    cleanups = [];
    documents.clear();
  };

  const queueRefresh = () => {
    if (disposed) return;
    if (refreshQueued) return;
    refreshQueued = true;
    queueMicrotask(() => {
      refreshQueued = false;
      refresh(true);
    });
  };

  const observeWindow = (win: Window) => {
    let doc: Document;
    let view: Window & typeof globalThis;
    try {
      doc = win.document;
      if (documents.has(doc)) return false;
      const defaultView = doc.defaultView;
      if (!defaultView) return false;
      view = defaultView;
    } catch {
      return false;
    }
    documents.add(doc);

    const observer = new view.MutationObserver((records) => {
      if (!hasFrameMutation(records)) return;
      queueRefresh();
    });
    const onLoad = (event: Event) => {
      if (!isElement(event.target)) return;
      if (event.target.tagName !== "IFRAME") return;
      const frameWindow = (event.target as HTMLIFrameElement).contentWindow;
      if (frameWindow && observeWindowTree(frameWindow)) {
        listener(frameWindow);
      }
      queueRefresh();
    };
    const onBlur = (event: FocusEvent) => {
      if (event.target !== view) return;
      try {
        if (!scope.document.hasFocus()) return;
      } catch {
        return;
      }
      const focusedWindow = getFocusedFrameWindow(scope);
      if (!focusedWindow) return;
      if (!observeWindowTree(focusedWindow)) return;
      listener(focusedWindow);
      queueRefresh();
    };
    observer.observe(doc, { childList: true, subtree: true });
    doc.addEventListener("load", onLoad, true);
    view.addEventListener("blur", onBlur, true);
    cleanups.push(() => {
      observer.disconnect();
      try {
        doc.removeEventListener("load", onLoad, true);
        view.removeEventListener("blur", onBlur, true);
      } catch {}
    });
    return true;
  };

  const observeWindowTree = (win: Window) => {
    let observed = false;
    for (const frameWindow of getFrameWindows(win)) {
      observed = observeWindow(frameWindow) || observed;
    }
    return observed;
  };

  const refresh = (notify = false) => {
    disconnect();
    if (disposed) return;

    observeWindowTree(scope);

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
