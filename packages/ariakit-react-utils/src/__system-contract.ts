import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";
import type * as _Matchers from "../../../vitest.d.ts";

export type SystemScenario = "native" | "render" | "wrapper" | "replacement";

export function testSystem(
  mount: (scenario: SystemScenario) => Promise<() => void>,
) {
  test("changing the render callback replaces the underlying element", async () => {
    const unmount = await mount("replacement");
    try {
      const original = q.status("View");
      expect(original.tagName).toBe("DIV");
      await click(q.button("Switch element"));
      const replacement = q.status("View");
      expect(replacement.tagName).toBe("SECTION");
      expect(replacement).toHaveTextContent("Swappable");
      expect(original).not.toBeInTheDocument();
    } finally {
      unmount();
    }
  });

  test("native props and children update without replacing the element", async () => {
    const unmount = await mount("native");
    try {
      const status = q.status("Counter");
      expect(status.tagName).toBe("DIV");
      expect(status).toHaveTextContent("0");
      expect(status).toHaveAttribute("title", "Initial");
      await click(q.button("Increment"));
      expect(status).toHaveTextContent("1");
      expect(status).not.toHaveAttribute("title");
      expect(q.status("Counter")).toBe(status);
      expect(status).not.toHaveAttribute("render");
      expect(status).not.toHaveAttribute("wrapElement");
    } finally {
      unmount();
    }
  });

  test("render callbacks receive live props, events, children, and refs", async () => {
    const unmount = await mount("render");
    try {
      const button = q.button("Count: 0");
      expect(button).toHaveAttribute("data-count", "0");
      await click(button);
      expect(q.button("Count: 1")).toBe(button);
      expect(button).toHaveAttribute("data-count", "1");
      await click(q.button("Focus counter"));
      expect(button).toHaveFocus();
    } finally {
      unmount();
    }
  });

  test("wrappers provide context to the rendered subtree", async () => {
    const unmount = await mount("wrapper");
    try {
      expect(q.status("Context")).toHaveTextContent("Wrapped");
      await click(q.button("Hide"));
      expect(q.status.maybe("Context")).not.toBeInTheDocument();
      await click(q.button("Show"));
      expect(q.status("Context")).toHaveTextContent("Wrapped");
    } finally {
      unmount();
    }
  });
}
