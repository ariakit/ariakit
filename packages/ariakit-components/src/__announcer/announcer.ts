import { getVisuallyHiddenStyle, getWindow } from "@ariakit/utils";

export type AnnouncementPriority = "polite" | "assertive";

interface AnnouncementHost {
  element: HTMLDivElement;
  keyedNodes: Map<string, Text[]>;
  regions: Record<AnnouncementPriority, HTMLDivElement>;
}

interface AnnounceOptions {
  key?: string;
  priority?: AnnouncementPriority;
  nodeLifetime?: number;
  scope?: object;
}

interface PendingAnnouncement {
  messages: readonly string[];
  options: AnnounceOptions;
}

interface PendingDocument {
  announcements: PendingAnnouncement[];
  flush: () => void;
  leases: number;
  observer?: MutationObserver;
}

interface AppendAnnouncementParams {
  document: Document;
  host: AnnouncementHost;
  messages: readonly string[];
  options: AnnounceOptions;
}

const hosts = new WeakMap<Document, AnnouncementHost>();
const pendingDocuments = new WeakMap<Document, PendingDocument>();

function disposePendingDocument(
  document: Document,
  pendingDocument: PendingDocument,
) {
  if (pendingDocuments.get(document) !== pendingDocument) return;
  pendingDocuments.delete(document);
  pendingDocument.observer?.disconnect();
  document.removeEventListener("DOMContentLoaded", pendingDocument.flush);
}

function disposePendingDocumentIfEmpty(
  document: Document,
  pendingDocument: PendingDocument,
) {
  if (pendingDocument.leases) return;
  if (pendingDocument.announcements.length) return;
  disposePendingDocument(document, pendingDocument);
}

function createRegion(document: Document, priority: AnnouncementPriority) {
  const region = document.createElement("div");
  region.setAttribute("role", "log");
  region.setAttribute("aria-live", priority);
  region.setAttribute("aria-atomic", "false");
  region.setAttribute("aria-relevant", "additions text");
  return region;
}

function getHost(document: Document) {
  const { body } = document;
  if (!body) return null;

  let host = hosts.get(document);
  if (!host) {
    const element = document.createElement("div");
    element.dataset.notifications = "";
    Object.assign(element.style, getVisuallyHiddenStyle());

    host = {
      element,
      keyedNodes: new Map(),
      regions: {
        polite: createRegion(document, "polite"),
        assertive: createRegion(document, "assertive"),
      },
    };
    element.appendChild(host.regions.polite);
    element.appendChild(host.regions.assertive);
    hosts.set(document, host);
  }

  if (!host.element.isConnected) {
    body.appendChild(host.element);
  }
  return host;
}

function appendAnnouncement({
  document,
  host,
  messages,
  options: { key, priority = "polite", nodeLifetime = 350 },
}: AppendAnnouncementParams) {
  if (key) {
    const previousNodes = host.keyedNodes.get(key);
    for (const node of previousNodes || []) {
      node.remove();
    }
  }

  const nodes: Text[] = [];
  for (const message of messages) {
    if (!message) continue;
    const node = document.createTextNode(message);
    host.regions[priority].appendChild(node);
    nodes.push(node);
  }

  if (!nodes.length) return;
  if (key) {
    host.keyedNodes.set(key, nodes);
  }

  const ownerWindow = getWindow(document);
  ownerWindow.setTimeout(() => {
    for (const node of nodes) {
      node.remove();
    }
    if (key && host.keyedNodes.get(key) === nodes) {
      host.keyedNodes.delete(key);
    }
  }, nodeLifetime);
}

function flushPendingAnnouncements(document: Document) {
  const pendingDocument = pendingDocuments.get(document);
  if (!pendingDocument) return;
  const host = getHost(document);
  if (!host) return;

  disposePendingDocument(document, pendingDocument);

  for (const announcement of pendingDocument.announcements) {
    appendAnnouncement({ document, host, ...announcement });
  }
}

function waitForHost(document: Document) {
  const currentPendingDocument = pendingDocuments.get(document);
  if (currentPendingDocument) return currentPendingDocument;

  const pendingDocument: PendingDocument = {
    announcements: [],
    flush: () => flushPendingAnnouncements(document),
    leases: 0,
  };
  pendingDocuments.set(document, pendingDocument);
  document.addEventListener("DOMContentLoaded", pendingDocument.flush);

  const MutationObserver = getWindow(document).MutationObserver;
  pendingDocument.observer = new MutationObserver(pendingDocument.flush);
  pendingDocument.observer.observe(document, {
    childList: true,
    subtree: true,
  });
  return pendingDocument;
}

/** Creates the permanent announcement host in `document` when possible. */
export function primeAnnouncer(document: Document) {
  if (getHost(document)) {
    flushPendingAnnouncements(document);
    return () => {};
  }
  const pendingDocument = waitForHost(document);
  pendingDocument.leases += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    pendingDocument.leases -= 1;
    disposePendingDocumentIfEmpty(document, pendingDocument);
  };
}

/** Cancels announcements that are still waiting for `document.body`. */
export function cancelAnnouncements(document: Document, scope: object) {
  const pendingDocument = pendingDocuments.get(document);
  if (!pendingDocument) return;
  pendingDocument.announcements = pendingDocument.announcements.filter(
    (announcement) => announcement.options.scope !== scope,
  );
  disposePendingDocumentIfEmpty(document, pendingDocument);
}

/** Appends announcement text to the shared host for `document`. */
export function announce(
  document: Document,
  messages: string | readonly string[],
  options: AnnounceOptions = {},
) {
  const values = typeof messages === "string" ? [messages] : [...messages];
  const host = getHost(document);
  if (host) {
    flushPendingAnnouncements(document);
    appendAnnouncement({ document, host, messages: values, options });
    return;
  }

  waitForHost(document).announcements.push({
    messages: values,
    options: { ...options },
  });
}
