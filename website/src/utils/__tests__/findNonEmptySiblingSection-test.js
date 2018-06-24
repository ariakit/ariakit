import findNonEmptySiblingSection from "../findNonEmptySiblingSection";

test("findNonEmptySiblingSection", () => {
  const sections = [
    { name: "foo", hasExamples: true, props: { examples: "foo" } },
    {
      name: "bar",
      content: "bar",
      sections: [
        { name: "baz", sections: [{ name: "qux" }] },
        { name: "quux", content: "quux", sections: [{ name: "quuz" }] }
      ]
    }
  ];
  expect(findNonEmptySiblingSection(sections, "bar").name).toBe("quux");
  expect(findNonEmptySiblingSection(sections, "bar", true).name).toBe("foo");
  expect(findNonEmptySiblingSection(sections, "quux")).toBeUndefined();
  expect(findNonEmptySiblingSection(sections, "abc")).toBeUndefined();
});
