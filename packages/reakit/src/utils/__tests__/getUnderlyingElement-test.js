import getUnderlyingElement from "../getUnderlyingElement";

it("gets underlying element from as", () => {
  expect(getUnderlyingElement({ as: "div" })).toBe("div");
});

it("gets underlying element from nextAs", () => {
  expect(getUnderlyingElement({ nextAs: ["div"] })).toBe("div");
});

it("gets underlying element from last nextAs", () => {
  expect(getUnderlyingElement({ nextAs: ["h1", "div"] })).toBe("div");
});

it("gets underlying element from as even if it has nextAs", () => {
  expect(getUnderlyingElement({ as: "h1", nextAs: ["div"] })).toBe("h1");
});

it("gets underlying element from nextAs if as is not string", () => {
  expect(getUnderlyingElement({ as: () => {}, nextAs: ["div"] })).toBe("div");
});

it("returns div by default", () => {
  expect(getUnderlyingElement({})).toBe("div");
});
