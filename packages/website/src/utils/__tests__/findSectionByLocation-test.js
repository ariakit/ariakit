import findSectionByLocation from "../findSectionByLocation";

test("findSectionByLocation", () => {
  const location = { pathname: "/foo/bar/baz" };
  const sections = [
    { slug: "qux" },
    {
      slug: "foo",
      sections: [
        { slug: "baz", sections: [{ slug: "foo" }] },
        {
          sections: [{ slug: "bar", sections: [{ slug: "baz" }] }]
        }
      ]
    }
  ];
  expect(findSectionByLocation(sections, location)).toEqual({ slug: "baz" });
});
