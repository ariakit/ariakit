import isComponentSection from "../isComponentSection";

describe("isComponentSection", () => {
  test("with no filepath", () => {
    const section = {
      name: "Components"
    };

    expect(isComponentSection(section)).toBe(false);
  });

  test("guide section", () => {
    const section = {
      name: "Composability",
      filepath: "docs/composability.md"
    };

    expect(isComponentSection(section)).toBe(false);
  });

  test("component section", () => {
    const section = {
      name: "Base",
      filepath: "src/components/Base/Base.js"
    };

    expect(isComponentSection(section)).toBe(true);
  });
});
