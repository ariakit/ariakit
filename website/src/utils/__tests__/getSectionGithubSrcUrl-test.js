import getSectionGithubSrcUrl from "../getSectionGithubSrcUrl";

describe("getSectionGithubSrcUrl", () => {
  test("with no filepath", () => {
    const section = {
      name: "Components"
    };

    expect(getSectionGithubSrcUrl(section, "doc")).toEqual(null);
  });

  describe("guide section", () => {
    const section = {
      name: "Composability",
      filepath: "docs/composability.md"
    };
    test("returns the doc url", () => {
      expect(getSectionGithubSrcUrl(section, "doc")).toEqual(
        "https://github.com/diegohaz/reakit/tree/master/docs/composability.md"
      );
    });
    test("does not return a component url", () => {
      expect(getSectionGithubSrcUrl(section, "component")).toEqual(null);
    });
  });

  describe("component section", () => {
    const section = {
      name: "Base",
      filepath: "src/components/Base/Base.js"
    };
    test("returns the doc url", () => {
      expect(getSectionGithubSrcUrl(section, "doc")).toEqual(
        "https://github.com/diegohaz/reakit/tree/master/src/components/Base/Base.md"
      );
    });
    test("does not return a component url", () => {
      expect(getSectionGithubSrcUrl(section, "component")).toEqual(
        "https://github.com/diegohaz/reakit/tree/master/src/components/Base/Base.js"
      );
    });
  });
});
