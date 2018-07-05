import filterSections from "../filterSections";

test("filterSections", () => {
  const sections = [
    {
      slug: "components",
      sections: [
        {
          slug: "primitives",
          sections: [{ slug: "base" }, { slug: "foo" }, { slug: "bar" }]
        }
      ]
    },
    {
      slug: "guide",
      sections: [{ slug: "foo" }, { slug: "bar" }]
    }
  ];
  expect(filterSections(sections, "Bar")).toEqual([
    {
      slug: "components",
      sections: [
        {
          slug: "primitives",
          sections: [{ slug: "bar" }]
        }
      ]
    },
    {
      slug: "guide",
      sections: [{ slug: "bar" }]
    }
  ]);
});
