import { hasTransition, expand, origin, slide } from "../transitions";

const render = (props = {}) => (strings, ...interpolations) =>
  strings.reduce(
    (acc, curr, i) =>
      `${acc}${curr}${
        typeof interpolations[i] === "function"
          ? render(props)`${interpolations[i](props)}`
          : interpolations[i] || ""
      }`,
    ""
  );

test("hasTransition", () => {
  expect(hasTransition({})).toBe(false);
  expect(hasTransition({ animated: true })).toBe(true);
  expect(hasTransition({ fade: true })).toBe(true);
  expect(hasTransition({ slide: true })).toBe(true);
  expect(hasTransition({ expand: true })).toBe(true);
  expect(hasTransition({ slide: "top" })).toBe(true);
  expect(hasTransition({ expand: "bottom" })).toBe(true);
});

test("expand", () => {
  expect(render()`${expand()}`).toMatchInlineSnapshot(`""`);
  expect(render({ expand: true })`${expand()}`).toMatchInlineSnapshot(
    `"scale(0.00001)"`
  );
  expect(render({ expand: "top" })`${expand()}`).toMatchInlineSnapshot(
    `"scale(0.00001)"`
  );
});

test("origin", () => {
  expect(render()`${origin()}`).toMatchInlineSnapshot(
    `"calc(50% + 0px) calc(50% + 0px)"`
  );
  expect(render()`${origin({ x: "12px", y: "15px" })}`).toMatchInlineSnapshot(
    `"calc(50% + 12px) calc(50% + 15px)"`
  );
  expect(render({ expand: true })`${origin()}`).toMatchInlineSnapshot(
    `"calc(50% + 0px) calc(50% + 0px)"`
  );
  expect(render({ expand: "top" })`${origin()}`).toMatchInlineSnapshot(
    `"calc(50% + 0px) calc(100% + 0px)"`
  );
  expect(render({ expand: "right" })`${origin()}`).toMatchInlineSnapshot(
    `"calc(0px + 0px) calc(50% + 0px)"`
  );
  expect(render({ expand: "bottom" })`${origin()}`).toMatchInlineSnapshot(
    `"calc(50% + 0px) calc(0px + 0px)"`
  );
  expect(render({ expand: "left" })`${origin()}`).toMatchInlineSnapshot(
    `"calc(100% + 0px) calc(50% + 0px)"`
  );
  expect(
    render({ expand: true })`${origin({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"calc(50% + 12px) calc(50% + 15px)"`);
  expect(
    render({ expand: "top" })`${origin({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"calc(50% + 12px) calc(100% + 15px)"`);
  expect(
    render({ expand: "right" })`${origin({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"calc(0px + 12px) calc(50% + 15px)"`);
  expect(
    render({ expand: "bottom" })`${origin({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"calc(50% + 12px) calc(0px + 15px)"`);
  expect(
    render({ expand: "left" })`${origin({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"calc(100% + 12px) calc(50% + 15px)"`);
});

test("slide", () => {
  expect(render()`${slide()}`).toMatchInlineSnapshot(
    `"translateX(0px) translateY(0px)"`
  );
  expect(render()`${slide({ x: "12px", y: "15px" })}`).toMatchInlineSnapshot(
    `"translateX(12px) translateY(15px)"`
  );
  expect(render({ slide: true })`${slide()}`).toMatchInlineSnapshot(
    `"translateX(calc(-100% + 0px)) translateY(0px)"`
  );
  expect(render({ slide: "top" })`${slide()}`).toMatchInlineSnapshot(
    `"translateX(0px) translateY(calc(100% + 0px))"`
  );
  expect(render({ slide: "right" })`${slide()}`).toMatchInlineSnapshot(
    `"translateX(calc(-100% + 0px)) translateY(0px)"`
  );
  expect(render({ slide: "bottom" })`${slide()}`).toMatchInlineSnapshot(
    `"translateX(0px) translateY(calc(-100% + 0px))"`
  );
  expect(render({ slide: "left" })`${slide()}`).toMatchInlineSnapshot(
    `"translateX(calc(100% + 0px)) translateY(0px)"`
  );
  expect(render({ slide: true })`${slide({ defaultValue: "top" })}`).toEqual(
    render({ slide: "top" })`${slide()}`
  );
  expect(render({ slide: true })`${slide({ defaultValue: "right" })}`).toEqual(
    render({ slide: "right" })`${slide()}`
  );
  expect(render({ slide: true })`${slide({ defaultValue: "bottom" })}`).toEqual(
    render({ slide: "bottom" })`${slide()}`
  );
  expect(render({ slide: true })`${slide({ defaultValue: "left" })}`).toEqual(
    render({ slide: "left" })`${slide()}`
  );
  expect(
    render({ slide: true })`${slide({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"translateX(calc(-100% + 12px)) translateY(15px)"`);
  expect(
    render({ slide: "top" })`${slide({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"translateX(12px) translateY(calc(100% + 15px))"`);
  expect(
    render({ slide: "right" })`${slide({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"translateX(calc(-100% + 12px)) translateY(15px)"`);
  expect(
    render({ slide: "bottom" })`${slide({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"translateX(12px) translateY(calc(-100% + 15px))"`);
  expect(
    render({ slide: "left" })`${slide({ x: "12px", y: "15px" })}`
  ).toMatchInlineSnapshot(`"translateX(calc(100% + 12px)) translateY(15px)"`);
});
