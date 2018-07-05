import flattenSections from "../flattenSections";

test("flattenSections", () => {
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
  expect(flattenSections(sections)).toMatchSnapshot();
});
