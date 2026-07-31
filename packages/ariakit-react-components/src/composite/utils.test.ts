import { afterEach, expect, test, vi } from "vitest";
import { withDocumentScrollPreserved } from "./utils.ts";

afterEach(() => {
  document.documentElement.style.removeProperty("scroll-behavior");
  document.body.style.removeProperty("scroll-behavior");
  document.body.scrollLeft = 0;
  document.body.scrollTop = 0;
  vi.restoreAllMocks();
});

test("does not write the document scroll position when it does not change", () => {
  const scrollTo = vi.spyOn(document.documentElement, "scrollTo");

  withDocumentScrollPreserved(document.body, () => {});

  expect(scrollTo).not.toHaveBeenCalled();
});

test("uses the document root scroll behavior for a body scroller", () => {
  vi.spyOn(document, "scrollingElement", "get").mockReturnValue(document.body);
  const scrollTo = vi
    .spyOn(document.body, "scrollTo")
    .mockImplementation(() => {});

  document.documentElement.style.setProperty(
    "scroll-behavior",
    "smooth",
    "important",
  );
  document.body.scrollTop = 10;

  withDocumentScrollPreserved(document.body, () => {
    expect(
      document.documentElement.style.getPropertyValue("scroll-behavior"),
    ).toBe("auto");
    expect(
      document.documentElement.style.getPropertyPriority("scroll-behavior"),
    ).toBe("important");
    expect(document.body.style.getPropertyValue("scroll-behavior")).toBe("");
    document.body.scrollTop = 20;
  });

  expect(scrollTo).toHaveBeenCalledWith({
    left: 0,
    top: 10,
    behavior: "instant",
  });
  expect(
    document.documentElement.style.getPropertyValue("scroll-behavior"),
  ).toBe("smooth");
  expect(
    document.documentElement.style.getPropertyPriority("scroll-behavior"),
  ).toBe("important");
});
