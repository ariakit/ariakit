import getSectionUrl from "../getSectionUrl";

test("getSectionUrl", () => {
  const sections = [
    { name: "foo", slug: "foo" },
    {
      name: "bar",
      slug: "bar",
      sections: [
        { name: "baz", slug: "baz", sections: [{ name: "qux", slug: "qux" }] },
        {
          name: "quux",
          slug: "quux",
          sections: [{ name: "quuz", slug: "quuz" }]
        }
      ]
    }
  ];
  expect(getSectionUrl(sections, "foo")).toBe("/foo");
  expect(getSectionUrl(sections, "foo", "/bar/")).toBe("/bar/foo");
  expect(getSectionUrl(sections, "bar")).toBe("/bar");
  expect(getSectionUrl(sections, "baz")).toBe("/bar/baz");
  expect(getSectionUrl(sections, "qux")).toBe("/bar/baz/qux");
  expect(getSectionUrl(sections, "quux")).toBe("/bar/quux");
  expect(getSectionUrl(sections, "quuz")).toBe("/bar/quux/quuz");
  expect(getSectionUrl(sections, "corge")).toBe("/");
});
