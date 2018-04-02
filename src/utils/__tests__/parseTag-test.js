import React from "react";
import parseTag from "../parseTag";

it("returns string tag when string is passed in", () => {
  expect(parseTag("div")).toBe("div");
});

it("returns string tag when arg1[0] is string", () => {
  expect(parseTag(["div"])).toBe("div");
});

it("returns last string tag when arg1[0] is string", () => {
  expect(parseTag(["div", "span"])).toBe("span");
});

it("returns the component when it is passed in", () => {
  const Component = () => <div />;
  expect(parseTag(Component)).toBe(Component);
});

it("returns array when first tag is a component", () => {
  const Component = () => <div />;
  expect(parseTag([Component, "div"])).toEqual([Component, "div"]);
});

it("removes string tags from middle", () => {
  const Component = () => <div />;
  expect(parseTag([Component, "div", "span"])).toEqual([Component, "span"]);
});

it("returns span when nothing is passed in", () => {
  expect(parseTag()).toBe("span");
});

it("returns span when empty array is passed in", () => {
  expect(parseTag([])).toBe("span");
});
