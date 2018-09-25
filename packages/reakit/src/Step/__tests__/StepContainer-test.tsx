import StepContainer from "../StepContainer";
import c from "../../_utils/callMeMaybe";

const { initialState, selectors: s, actions: a } = StepContainer;

const state = (obj?: object) => ({ ...initialState, ...obj });

test("initialState", () => {
  expect(state()).toEqual({
    loop: false,
    ids: [],
    current: -1,
    ordered: {}
  });
});

test("getCurrentId", () => {
  expect(s.getCurrentId()(state())).toBeUndefined();
  expect(s.getCurrentId()(state({ ids: ["a", "b"], current: 1 }))).toBe("b");
});

test("hasPrevious", () => {
  expect(s.hasPrevious()(state())).toBe(false);
  expect(s.hasPrevious()(state({ ids: ["a", "b"] }))).toBe(false);
  expect(s.hasPrevious()(state({ ids: ["a", "b"], current: 0 }))).toBe(false);
  expect(s.hasPrevious()(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
});

test("hasNext", () => {
  expect(s.hasNext()(state())).toBe(false);
  expect(s.hasNext()(state({ ids: ["a", "b"] }))).toBe(true);
  expect(s.hasNext()(state({ ids: ["a", "b"], current: 0 }))).toBe(true);
  expect(s.hasNext()(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
});

test("indexOf", () => {
  expect(s.indexOf(0)(state())).toBe(0);
  expect(s.indexOf("a")(state())).toBe(-1);
  expect(s.indexOf("b")(state({ ids: ["a", "b"] }))).toBe(1);
  expect(s.indexOf("c")(state({ ids: ["a", "b"] }))).toBe(-1);
});

test("isCurrent", () => {
  expect(s.isCurrent(-1)(state())).toBe(false);
  expect(s.isCurrent(0)(state())).toBe(false);
  expect(s.isCurrent("a")(state())).toBe(false);
  expect(s.isCurrent(-1)(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(s.isCurrent(0)(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(s.isCurrent(1)(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
  expect(s.isCurrent("a")(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(s.isCurrent("b")(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
});

test("show", () => {
  expect(c(a.show(0), state())).toEqual({ current: 0 });
  expect(c(a.show(1), state())).toEqual({ current: 1 });
  expect(c(a.show("b"), state({ ids: ["a", "b"] }))).toEqual({
    current: 1
  });
  expect(c(a.show("a"), state({ ids: ["a", "b"] }))).toEqual({
    current: 0
  });
});

test("hide", () => {
  expect(c(a.hide(), state())).toEqual({ current: -1 });
});

test("toggle", () => {
  expect(c(a.toggle(0), state())).toEqual({ current: 0 });
  expect(c(a.toggle(0), state({ current: 0 }))).toEqual({ current: -1 });
  expect(c(a.toggle("a"), state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: -1
  });
  expect(c(a.toggle("b"), state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: 1
  });
});

test("previous", () => {
  expect(c(a.previous(), state())).toEqual({});
  expect(c(a.previous(), state({ ids: ["a", "b"] }))).toEqual({});
  expect(c(a.previous(), state({ ids: ["a", "b"], current: 0 }))).toEqual({});
  expect(c(a.previous(), state({ ids: ["a", "b"], current: 1 }))).toEqual({
    current: 0
  });
  expect(c(a.previous(), state({ ids: ["a", "b"], loop: true }))).toEqual({
    current: 1
  });
  expect(
    c(a.previous(), state({ ids: ["a", "b"], loop: true, current: 1 }))
  ).toEqual({
    current: 0
  });
});

test("next", () => {
  expect(c(a.next(), state())).toEqual({});
  expect(c(a.next(), state({ ids: ["a", "b"] }))).toEqual({ current: 0 });
  expect(c(a.next(), state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: 1
  });
  expect(c(a.next(), state({ ids: ["a", "b"], current: 1 }))).toEqual({});
  expect(c(a.next(), state({ ids: ["a", "b"], loop: true }))).toEqual({
    current: 0
  });
  expect(
    c(a.next(), state({ ids: ["a", "b"], loop: true, current: 1 }))
  ).toEqual({
    current: 0
  });
});

test("reorder", () => {
  expect(c(a.reorder("a", 1), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c", "a"],
    ordered: { a: 1 }
  });
  expect(c(a.reorder("c", -1), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["c", "a", "b"],
    ordered: { c: -1 }
  });
  expect(c(a.reorder("a", 0), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["a", "b", "c"],
    ordered: { a: 0 }
  });
  expect(
    c(a.reorder("a", 1), state({ ids: ["a", "b", "c"], current: 0 }))
  ).toEqual({
    ids: ["b", "c", "a"],
    ordered: { a: 1 },
    current: 2
  });
});

test("register", () => {
  expect(c(a.register("a"), state())).toEqual({
    ids: ["a"],
    ordered: { a: 0 }
  });
  expect(c(a.register("b"), state({ ids: ["a"], ordered: { a: 0 } }))).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(
    c(a.register("b"), state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(
    c(a.register("b"), state({ ids: ["a", "b"], ordered: { a: 0 } }))
  ).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(
    c(a.register("b", -1), state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["b", "a"],
    ordered: { a: 0, b: -1 }
  });
  expect(
    c(a.register("c", -1), state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["c", "a", "b"],
    ordered: { a: 0, b: 0, c: -1 }
  });
});

test("unregister", () => {
  expect(c(a.unregister("a"), state())).toEqual({});
  expect(c(a.unregister("a"), state({ ids: ["a", "b"] }))).toEqual({
    ids: ["b"],
    ordered: {}
  });
  expect(c(a.unregister("a"), state({ ids: ["a", "b"], current: 0 }))).toEqual({
    ids: ["b"],
    ordered: {}
  });
  expect(
    c(a.unregister("c"), state({ ids: ["a", "b", "c"], current: 2 }))
  ).toEqual({
    ids: ["a", "b"],
    current: 1,
    ordered: {}
  });
  expect(c(a.unregister("a"), state({ ids: ["a"], current: 0 }))).toEqual({
    ids: [],
    current: -1,
    ordered: {}
  });
  expect(
    c(a.unregister("a"), state({ ids: ["a", "b", "c"], current: 2 }))
  ).toEqual({
    ids: ["b", "c"],
    current: 1,
    ordered: {}
  });
  expect(
    c(a.unregister("a"), state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["b"],
    ordered: { b: 0 }
  });
});

test("update", () => {
  expect(c(a.update("a", "a"), state({ ids: ["a", "b", "c"] }))).toEqual({});
  expect(c(a.update("a", "d"), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["d", "b", "c"],
    ordered: { d: 0 }
  });
  expect(c(a.update("a", "d", 99), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c", "d"],
    ordered: { d: 99 }
  });
  expect(c(a.update("a", "b"), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c"],
    ordered: {}
  });
  expect(c(a.update("a", "b", 99), state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["c", "b"],
    ordered: { b: 99 }
  });
});
