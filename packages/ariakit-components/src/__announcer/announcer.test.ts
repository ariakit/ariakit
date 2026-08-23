import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { announce, primeAnnouncer } from "./announcer.ts";

function getHost(ownerDocument = document) {
  return ownerDocument.querySelector<HTMLElement>("[data-notifications]");
}

function getRegion(priority: "polite" | "assertive", ownerDocument = document) {
  return ownerDocument.querySelector<HTMLElement>(
    `[role="log"][aria-live="${priority}"]`,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  for (const region of document.querySelectorAll(
    '[data-notifications] [role="log"]',
  )) {
    region.replaceChildren();
  }
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test("creates one clipped host with polite and assertive log regions", () => {
  primeAnnouncer(document);
  primeAnnouncer(document);

  expect(document.querySelectorAll("[data-notifications]")).toHaveLength(1);

  const host = getHost();
  expect(host).toHaveStyle({
    clipPath: "inset(50%)",
    height: "1px",
    overflow: "hidden",
    position: "absolute",
    width: "1px",
  });

  const regions = host?.querySelectorAll(':scope > [role="log"]');
  expect(regions).toHaveLength(2);
  expect(getRegion("polite")).toHaveAttribute("aria-atomic", "false");
  expect(getRegion("polite")).toHaveAttribute(
    "aria-relevant",
    "additions text",
  );
  expect(getRegion("assertive")).toHaveAttribute("aria-atomic", "false");
  expect(getRegion("assertive")).toHaveAttribute(
    "aria-relevant",
    "additions text",
  );
});

test("appends each message as a new text node in the requested region", () => {
  announce(document, ["Upload complete", "Three files are ready."], {
    priority: "assertive",
    nodeLifetime: 100,
  });

  const polite = getRegion("polite");
  const assertive = getRegion("assertive");
  expect(polite).toBeEmptyDOMElement();
  expect(assertive?.childNodes).toHaveLength(2);
  expect(assertive?.childNodes[0]).toBeInstanceOf(Text);
  expect(assertive?.childNodes[0]).toHaveTextContent("Upload complete");
  expect(assertive?.childNodes[1]).toBeInstanceOf(Text);
  expect(assertive?.childNodes[1]).toHaveTextContent("Three files are ready.");

  vi.advanceTimersByTime(99);
  expect(assertive?.childNodes).toHaveLength(2);
  vi.advanceTimersByTime(1);
  expect(assertive).toBeEmptyDOMElement();
});

test("replaces a keyed announcement by deleting and appending nodes", () => {
  announce(document, "Uploading 1 of 3.", {
    key: "upload",
    nodeLifetime: 100,
  });

  const polite = getRegion("polite");
  const firstNode = polite?.firstChild;
  expect(firstNode).toHaveTextContent("Uploading 1 of 3.");

  announce(document, "Uploading 2 of 3.", {
    key: "upload",
    nodeLifetime: 200,
  });

  const secondNode = polite?.firstChild;
  expect(firstNode?.isConnected).toBe(false);
  expect(secondNode).not.toBe(firstNode);
  expect(secondNode).toHaveTextContent("Uploading 2 of 3.");

  // The first write's cleanup must not remove the replacement.
  vi.advanceTimersByTime(100);
  expect(secondNode?.isConnected).toBe(true);
  expect(polite).toHaveTextContent("Uploading 2 of 3.");

  vi.advanceTimersByTime(100);
  expect(polite).toBeEmptyDOMElement();
});

test("keeps different keys independent across priority regions", () => {
  announce(document, "Background task complete.", {
    key: "background",
    nodeLifetime: 200,
  });
  announce(document, "Disk is filling up.", {
    key: "disk",
    nodeLifetime: 200,
  });

  announce(document, "Disk is full.", {
    key: "disk",
    priority: "assertive",
    nodeLifetime: 200,
  });

  expect(getRegion("polite")).toHaveTextContent("Background task complete.");
  expect(getRegion("polite")).not.toHaveTextContent("Disk is filling up.");
  expect(getRegion("assertive")).toHaveTextContent("Disk is full.");
});

test("reattaches the permanent host if application code removes it", () => {
  primeAnnouncer(document);
  const host = getHost();
  host?.remove();

  primeAnnouncer(document);

  expect(getHost()).toBe(host);
  expect(host?.isConnected).toBe(true);
});
