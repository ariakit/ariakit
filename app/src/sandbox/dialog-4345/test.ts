import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

test("scroll lock preserves the html element's inline overflow-y", async () => {
  const { documentElement } = document;
  expect(documentElement).toHaveStyle("overflow-y: scroll");
  await click(q.button("Show modal"));
  expect(q.dialog("Dialog")).toBeVisible();
  // happy-dom reports a space-consuming scrollbar and supports
  // scrollbar-gutter, so the lock lands on the html element. The overflow
  // longhands hide the page overflow while the inline overflow-y the page set
  // is captured for restore.
  expect(documentElement).toHaveStyle("scrollbar-gutter: stable");
  expect(documentElement).toHaveStyle("overflow-x: hidden");
  expect(documentElement).toHaveStyle("overflow-y: hidden");
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(documentElement).toHaveStyle("overflow-y: scroll");
  expect(documentElement).not.toHaveStyle("scrollbar-gutter: stable");
  expect(documentElement).not.toHaveStyle("overflow-x: hidden");
});

test("fallback scroll lock also hides the html overflow", async () => {
  const { documentElement, body } = document;
  // happy-dom's window.CSS getter returns a fresh object on every access, so
  // the getter itself must be mocked rather than a single instance's method.
  const unsupportedCSS: Pick<typeof CSS, "supports"> = {
    supports: () => false,
  };
  const supports = vi
    .spyOn(window, "CSS", "get")
    .mockReturnValue(unsupportedCSS as typeof CSS);
  try {
    await click(q.button("Show modal"));
    expect(q.dialog("Dialog")).toBeVisible();
    // The page scrolls through the html element (overflow-y: scroll), so the
    // padding fallback must also hide the html overflow to lock the scroll.
    expect(documentElement).toHaveStyle("--scrollbar-width: 1024px");
    expect(documentElement).toHaveStyle("overflow-y: hidden");
    expect(documentElement).not.toHaveStyle("scrollbar-gutter: stable");
    expect(body).toHaveStyle("overflow: hidden");
    expect(body).toHaveStyle("padding-right: 1024px");
    await press.Escape();
    expect(q.dialog("Dialog")).not.toBeInTheDocument();
    expect(documentElement).toHaveStyle("overflow-y: scroll");
    expect(documentElement).not.toHaveStyle("--scrollbar-width: 1024px");
    expect(body).not.toHaveStyle("overflow: hidden");
    expect(body).not.toHaveStyle("padding-right: 1024px");
  } finally {
    supports.mockRestore();
  }
});
