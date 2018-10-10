import findSectionByName from "../findSectionByName";

test("findSectionByName", () => {
  const sections = [
    { name: "foo" },
    {
      name: "bar",
      sections: [
        { name: "baz", sections: [{ name: "qux" }] },
        { name: "quux", sections: [{ name: "quuz" }] }
      ]
    }
  ];
  expect(findSectionByName(sections, "qux")).toEqual({ name: "qux" });
});
