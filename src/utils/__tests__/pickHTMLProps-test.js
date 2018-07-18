import pickHTMLProps from "../pickHTMLProps";

test("pickHTMLProps", () => {
  expect(
    pickHTMLProps("div", { "data-foo": true, foo: true, id: "foo" })
  ).toEqual({
    "data-foo": true,
    id: "foo"
  });
});
