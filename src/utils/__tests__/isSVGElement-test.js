import isSVGElement from "../isSVGElement";

it("works", () => {
  expect(isSVGElement("svg")).toBe(true);
  expect(isSVGElement("span")).toBe(false);
});
