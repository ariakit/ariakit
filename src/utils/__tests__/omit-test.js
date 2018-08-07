import omit from "../omit";

const { keys } = Object;
const fixture = {
  food: "icecream",
  animal: "dog",
  season: "spring",
  age: 22
};

test("arg string", () => {
  const omitted = keys(omit(fixture, "animal"));
  expect(omitted.includes("animal")).toBeFalsy();
});

test("arg string[]", () => {
  const omitted = keys(omit(fixture, ["animal", "age"]));
  expect(omitted.includes("animal") && omitted.includes("age")).toBeFalsy();
});

test("returns empty if omits all", () => {
  const omitted = omit(fixture, ["animal", "age", "season", "food"]);
  expect(omitted).toEqual({});
});

test("returns obj on falsy input", () => {
  const omitted = keys(omit(fixture));
  expect(omitted).toEqual(keys(fixture));
});
