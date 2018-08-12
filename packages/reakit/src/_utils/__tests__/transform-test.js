import {
  hasTransition,
  translate3d,
  origin,
  calc,
  minus,
  expand,
  slide,
  scaleWithProps,
  originWithProps,
  translateWithProps,
  slideWithProps
} from "../transform";

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

test("translate3d", () => {
  expect(translate3d()).toBe("translate3d(0px, 0px, 0px)");
  expect(translate3d(0, 0, 0)).toBe("translate3d(0px, 0px, 0px)");
  expect(translate3d(15, "1em")).toBe("translate3d(15px, 1em, 0px)");
});

test("origin", () => {
  expect(origin()).toBe("center center");
  expect(origin("", "50%")).toBe("0px 50%");
  expect(origin("1em", 12)).toBe("1em 12px");
});

test("calc", () => {
  expect(calc()).toBe("calc(0px + 0px)");
  expect(calc(50)).toBe("calc(50px + 0px)");
  expect(calc("", "1em")).toBe("calc(0px + 1em)");
});

test("minus", () => {
  expect(minus()).toBe("-0px");
  expect(minus(12)).toBe("-12px");
  expect(minus("1em")).toBe("-1em");
});

test("expand", () => {
  expect(render()`${expand}`).toBe("");
  expect(render({ expand: true })`${expand}`).toBe("center");
  expect(render({ expand: "top" })`${expand}`).toBe("top");
  expect(render({ expand: true, defaultExpand: "left" })`${expand}`).toBe(
    "left"
  );
});

test("slide", () => {
  expect(render()`${slide}`).toBe("");
  expect(render({ slide: true })`${slide}`).toBe("right");
  expect(render({ slide: "top" })`${slide}`).toBe("top");
  expect(render({ slide: true, defaultSlide: "left" })`${slide}`).toBe("left");
});

test("scaleWithProps", () => {
  expect(render()`${scaleWithProps}`).toBe("");
  expect(render({ expand: true })`${scaleWithProps}`).toBe("scale(0.01)");
  expect(render({ expand: "top" })`${scaleWithProps}`).toBe("scale(0.01)");
});

test("originWithProps", () => {
  expect(render()`${originWithProps}`).toBe("calc(50% + 0px) calc(50% + 0px)");
  expect(render({ originX: "12px", originY: "15px" })`${originWithProps}`).toBe(
    "calc(50% + 12px) calc(50% + 15px)"
  );
  expect(render({ expand: true })`${originWithProps}`).toBe(
    "calc(50% + 0px) calc(50% + 0px)"
  );
  expect(render({ expand: "top" })`${originWithProps}`).toBe(
    "calc(50% + 0px) calc(100% + 0px)"
  );
  expect(render({ expand: "right" })`${originWithProps}`).toBe(
    "center calc(50% + 0px)"
  );
  expect(render({ expand: "bottom" })`${originWithProps}`).toBe(
    "calc(50% + 0px) center"
  );
  expect(render({ expand: "left" })`${originWithProps}`).toBe(
    "calc(100% + 0px) calc(50% + 0px)"
  );
  expect(
    render({ expand: true, defaultExpand: "top" })`${originWithProps}`
  ).toEqual(render({ expand: "top" })`${originWithProps}`);
  expect(
    render({ expand: true, defaultExpand: "right" })`${originWithProps}`
  ).toEqual(render({ expand: "right" })`${originWithProps}`);
  expect(
    render({ expand: true, defaultExpand: "bottom" })`${originWithProps}`
  ).toEqual(render({ expand: "bottom" })`${originWithProps}`);
  expect(
    render({ expand: true, defaultExpand: "left" })`${originWithProps}`
  ).toEqual(render({ expand: "left" })`${originWithProps}`);
  expect(
    render({
      expand: true,
      originX: "12px",
      originY: "15px"
    })`${originWithProps}`
  ).toBe("calc(50% + 12px) calc(50% + 15px)");
  expect(
    render({
      expand: "top",
      originX: "12px",
      originY: "15px"
    })`${originWithProps}`
  ).toBe("calc(50% + 12px) calc(100% + 15px)");
  expect(
    render({
      expand: "right",
      originX: "12px",
      originY: "15px"
    })`${originWithProps}`
  ).toBe("12px calc(50% + 15px)");
  expect(
    render({
      expand: "bottom",
      originX: "12px",
      originY: "15px"
    })`${originWithProps}`
  ).toBe("calc(50% + 12px) 15px");
  expect(
    render({
      expand: "left",
      originX: "12px",
      originY: "15px"
    })`${originWithProps}`
  ).toBe("calc(100% + 12px) calc(50% + 15px)");
});

test("translateWithProps", () => {
  expect(render()`${translateWithProps}`).toBe("translate3d(0px, 0px, 0px)");
  expect(
    render({ translateX: 12, translateY: "1em" })`${translateWithProps}`
  ).toBe("translate3d(12px, 1em, 0px)");
});

test("slideWithProps", () => {
  expect(render()`${slideWithProps}`).toBe("translate3d(0px, 0px, 0px)");
  expect(
    render({ translateX: "12px", translateY: "15px" })`${slideWithProps}`
  ).toBe("translate3d(12px, 15px, 0px)");
  expect(render({ slide: true })`${slideWithProps}`).toBe(
    "translate3d(calc(-100% + 0px), 0px, 0px)"
  );
  expect(render({ slide: "top" })`${slideWithProps}`).toBe(
    "translate3d(0px, calc(100% + 0px), 0px)"
  );
  expect(render({ slide: "right" })`${slideWithProps}`).toBe(
    "translate3d(calc(-100% + 0px), 0px, 0px)"
  );
  expect(render({ slide: "bottom" })`${slideWithProps}`).toBe(
    "translate3d(0px, calc(-100% + 0px), 0px)"
  );
  expect(render({ slide: "left" })`${slideWithProps}`).toBe(
    "translate3d(calc(100% + 0px), 0px, 0px)"
  );
  expect(
    render({ slide: true, defaultSlide: "top" })`${slideWithProps}`
  ).toEqual(render({ slide: "top" })`${slideWithProps}`);
  expect(
    render({ slide: true, defaultSlide: "right" })`${slideWithProps}`
  ).toEqual(render({ slide: "right" })`${slideWithProps}`);
  expect(
    render({ slide: true, defaultSlide: "bottom" })`${slideWithProps}`
  ).toEqual(render({ slide: "bottom" })`${slideWithProps}`);
  expect(
    render({ slide: true, defaultSlide: "left" })`${slideWithProps}`
  ).toEqual(render({ slide: "left" })`${slideWithProps}`);
  expect(
    render({
      slide: true,
      translateX: "12px",
      translateY: "15px"
    })`${slideWithProps}`
  ).toBe("translate3d(calc(-100% + 12px), 15px, 0px)");
  expect(
    render({
      slide: "top",
      translateX: "12px",
      translateY: "15px"
    })`${slideWithProps}`
  ).toBe("translate3d(12px, calc(100% + 15px), 0px)");
  expect(
    render({
      slide: "right",
      translateX: "12px",
      translateY: "15px"
    })`${slideWithProps}`
  ).toBe("translate3d(calc(-100% + 12px), 15px, 0px)");
  expect(
    render({
      slide: "bottom",
      translateX: "12px",
      translateY: "15px"
    })`${slideWithProps}`
  ).toBe("translate3d(12px, calc(-100% + 15px), 0px)");
  expect(
    render({
      slide: "left",
      translateX: "12px",
      translateY: "15px"
    })`${slideWithProps}`
  ).toBe("translate3d(calc(100% + 12px), 15px, 0px)");
});
