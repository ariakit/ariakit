import type { AriaRole } from "../__aria-role.ts";
import { query } from "../playwright.ts";

interface MockLocator {
  path: string;
  getByRole(role: AriaRole, options?: { name?: string | RegExp }): MockLocator;
  getByText(text: string | RegExp): MockLocator;
}

function getMatcherText(matcher: string | RegExp | undefined) {
  if (matcher == null) return "";
  if (typeof matcher === "string") {
    return JSON.stringify(matcher);
  }
  return matcher.toString();
}

function createMockLocator(path: string): MockLocator {
  return {
    path,
    getByRole: vi.fn((role: AriaRole, options?: { name?: string | RegExp }) => {
      const name = getMatcherText(options?.name);
      return createMockLocator(`${path} > ${role}:${name}`);
    }),
    getByText: vi.fn((text: string | RegExp) => {
      return createMockLocator(`${path} > text:${getMatcherText(text)}`);
    }),
  };
}

function getPath(locator: MockLocator) {
  return locator.path;
}

test("within scopes queries using property syntax", () => {
  const page = createMockLocator("page");
  const q = query(page);

  const option = q.within.dialog("Dialog").option("Option");
  const equivalentOption = query(q.dialog("Dialog")).option("Option");

  expect(getPath(option)).toBe('page > dialog:"Dialog" > option:"Option"');
  expect(getPath(option)).toBe(getPath(equivalentOption));
  expect(page.getByRole).toHaveBeenNthCalledWith(1, "dialog", {
    name: "Dialog",
  });
});

test("within scopes queries using callable syntax", () => {
  const page = createMockLocator("page");
  const q = query(page);
  const dialog = q.dialog("Dialog");

  const option = q.within(dialog).option("Option");
  const equivalentOption = query(dialog).option("Option");

  expect(getPath(option)).toBe('page > dialog:"Dialog" > option:"Option"');
  expect(getPath(option)).toBe(getPath(equivalentOption));
  expect(dialog.getByRole).toHaveBeenCalledWith("option", {
    name: "Option",
  });
});
