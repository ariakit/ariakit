import { click, press, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

test("scroll lock preserves the html element's inline overflow-y", async () => {
  const { documentElement, body } = document;
  expect(documentElement).toHaveStyle("overflow-y: scroll");
  await click(q.button("Show modal"));
  expect(q.dialog("Dialog")).toBeVisible();
  expect(documentElement).toHaveStyle("overflow-x: hidden");
  expect(documentElement).toHaveStyle("overflow-y: hidden");
  expect(
    documentElement.style.scrollbarGutter === "stable" ||
      body.style.overflow === "hidden",
  ).toBe(true);
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(documentElement).toHaveStyle("overflow-y: scroll");
  expect(documentElement).not.toHaveStyle("scrollbar-gutter: stable");
  expect(documentElement).not.toHaveStyle("overflow-x: hidden");
});

test("fallback scroll lock also hides the html overflow", async () => {
  const { documentElement, body } = document;
  using _clientWidth = vi
    .spyOn(documentElement, "clientWidth", "get")
    .mockReturnValue(window.innerWidth - 20);
  const unsupportedCSS: Pick<typeof CSS, "supports"> = {
    supports: () => false,
  };
  using _supports = vi
    .spyOn(window, "CSS", "get")
    .mockReturnValue(unsupportedCSS as typeof CSS);
  await click(q.button("Show modal"));
  expect(q.dialog("Dialog")).toBeVisible();
  // The page scrolls through the html element (overflow-y: scroll), so the
  // padding fallback must also hide the html overflow to lock the scroll.
  expect(documentElement).toHaveStyle("--scrollbar-width: 20px");
  expect(documentElement).toHaveStyle("overflow-y: hidden");
  expect(documentElement).not.toHaveStyle("scrollbar-gutter: stable");
  expect(body).toHaveStyle("overflow: hidden");
  expect(body).toHaveStyle("padding-right: 20px");
  await press.Escape();
  expect(q.dialog("Dialog")).not.toBeInTheDocument();
  expect(documentElement).toHaveStyle("overflow-y: scroll");
  expect(documentElement).not.toHaveStyle("--scrollbar-width: 20px");
  expect(body).not.toHaveStyle("overflow: hidden");
  expect(body).not.toHaveStyle("padding-right: 20px");
});
