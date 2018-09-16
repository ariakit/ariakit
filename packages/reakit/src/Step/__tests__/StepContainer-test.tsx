import {
  initialState,
  getCurrentId,
  hasPrevious,
  hasNext,
  indexOf,
  isCurrent,
  show,
  hide,
  toggle,
  previous,
  next,
  reorder,
  register,
  unregister,
  update
} from "../StepContainer";

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
  expect(getCurrentId()(state())).toBeUndefined();
  expect(getCurrentId()(state({ ids: ["a", "b"], current: 1 }))).toBe("b");
});

test("hasPrevious", () => {
  expect(hasPrevious()(state())).toBe(false);
  expect(hasPrevious()(state({ ids: ["a", "b"] }))).toBe(false);
  expect(hasPrevious()(state({ ids: ["a", "b"], current: 0 }))).toBe(false);
  expect(hasPrevious()(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
});

test("hasNext", () => {
  expect(hasNext()(state())).toBe(false);
  expect(hasNext()(state({ ids: ["a", "b"] }))).toBe(true);
  expect(hasNext()(state({ ids: ["a", "b"], current: 0 }))).toBe(true);
  expect(hasNext()(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
});

test("indexOf", () => {
  expect(indexOf(0)(state())).toBe(0);
  expect(indexOf("a")(state())).toBe(-1);
  expect(indexOf("b")(state({ ids: ["a", "b"] }))).toBe(1);
  expect(indexOf("c")(state({ ids: ["a", "b"] }))).toBe(-1);
});

test("isCurrent", () => {
  expect(isCurrent(-1)(state())).toBe(false);
  expect(isCurrent(0)(state())).toBe(false);
  expect(isCurrent("a")(state())).toBe(false);
  expect(isCurrent(-1)(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(isCurrent(0)(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(isCurrent(1)(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
  expect(isCurrent("a")(state({ ids: ["a", "b"], current: 1 }))).toBe(false);
  expect(isCurrent("b")(state({ ids: ["a", "b"], current: 1 }))).toBe(true);
});

test("show", () => {
  expect(show(0)(state())).toEqual({ current: 0 });
  expect(show(1)(state())).toEqual({ current: 1 });
  expect(show("b")(state({ ids: ["a", "b"] }))).toEqual({ current: 1 });
  expect(show("a")(state({ ids: ["a", "b"] }))).toEqual({ current: 0 });
});

test("hide", () => {
  expect(hide()()).toEqual({ current: -1 });
});

test("toggle", () => {
  expect(toggle(0)(state())).toEqual({ current: 0 });
  expect(toggle(0)(state({ current: 0 }))).toEqual({ current: -1 });
  expect(toggle("a")(state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: -1
  });
  expect(toggle("b")(state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: 1
  });
});

test("previous", () => {
  expect(previous()(state())).toEqual({});
  expect(previous()(state({ ids: ["a", "b"] }))).toEqual({});
  expect(previous()(state({ ids: ["a", "b"], current: 0 }))).toEqual({});
  expect(previous()(state({ ids: ["a", "b"], current: 1 }))).toEqual({
    current: 0
  });
  expect(previous()(state({ ids: ["a", "b"], loop: true }))).toEqual({
    current: 1
  });
  expect(
    previous()(state({ ids: ["a", "b"], loop: true, current: 1 }))
  ).toEqual({
    current: 0
  });
});

test("next", () => {
  expect(next()(state())).toEqual({});
  expect(next()(state({ ids: ["a", "b"] }))).toEqual({ current: 0 });
  expect(next()(state({ ids: ["a", "b"], current: 0 }))).toEqual({
    current: 1
  });
  expect(next()(state({ ids: ["a", "b"], current: 1 }))).toEqual({});
  expect(next()(state({ ids: ["a", "b"], loop: true }))).toEqual({
    current: 0
  });
  expect(next()(state({ ids: ["a", "b"], loop: true, current: 1 }))).toEqual({
    current: 0
  });
});

test("reorder", () => {
  expect(reorder("a", 1)(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c", "a"],
    ordered: { a: 1 }
  });
  expect(reorder("c", -1)(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["c", "a", "b"],
    ordered: { c: -1 }
  });
  expect(reorder("a", 0)(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["a", "b", "c"],
    ordered: { a: 0 }
  });
  expect(reorder("a", 1)(state({ ids: ["a", "b", "c"], current: 0 }))).toEqual({
    ids: ["b", "c", "a"],
    ordered: { a: 1 },
    current: 2
  });
});

test("register", () => {
  expect(register("a")(state())).toEqual({
    ids: ["a"],
    ordered: { a: 0 }
  });
  expect(register("b")(state({ ids: ["a"], ordered: { a: 0 } }))).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(
    register("b")(state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(register("b")(state({ ids: ["a", "b"], ordered: { a: 0 } }))).toEqual({
    ids: ["a", "b"],
    ordered: { a: 0, b: 0 }
  });
  expect(
    register("b", -1)(state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["b", "a"],
    ordered: { a: 0, b: -1 }
  });
  expect(
    register("c", -1)(state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["c", "a", "b"],
    ordered: { a: 0, b: 0, c: -1 }
  });
});

test("unregister", () => {
  expect(unregister("a")(state())).toEqual({});
  expect(unregister("a")(state({ ids: ["a", "b"] }))).toEqual({
    ids: ["b"],
    ordered: {}
  });
  expect(unregister("a")(state({ ids: ["a", "b"], current: 0 }))).toEqual({
    ids: ["b"],
    ordered: {}
  });
  expect(unregister("c")(state({ ids: ["a", "b", "c"], current: 2 }))).toEqual({
    ids: ["a", "b"],
    current: 1,
    ordered: {}
  });
  expect(unregister("a")(state({ ids: ["a"], current: 0 }))).toEqual({
    ids: [],
    current: -1,
    ordered: {}
  });
  expect(unregister("a")(state({ ids: ["a", "b", "c"], current: 2 }))).toEqual({
    ids: ["b", "c"],
    current: 1,
    ordered: {}
  });
  expect(
    unregister("a")(state({ ids: ["a", "b"], ordered: { a: 0, b: 0 } }))
  ).toEqual({
    ids: ["b"],
    ordered: { b: 0 }
  });
});

test("update", () => {
  expect(update("a", "a")(state({ ids: ["a", "b", "c"] }))).toEqual({});
  expect(update("a", "d")(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["d", "b", "c"],
    ordered: { d: 0 }
  });
  expect(update("a", "d", 99)(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c", "d"],
    ordered: { d: 99 }
  });
  expect(update("a", "b")(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["b", "c"],
    ordered: {}
  });
  expect(update("a", "b", 99)(state({ ids: ["a", "b", "c"] }))).toEqual({
    ids: ["c", "b"],
    ordered: { b: 99 }
  });
});
