import * as React from "react";

import { mergeProps } from "../mergeProps";

test("single ref", () => {
  const ref = jest.fn();
  const merged = mergeProps({ a: "a", ref }, { b: "b" });
  expect(merged.a).toBe("a");
  expect(merged.b).toBe("b");
  expect(merged.ref).toBe(ref);
});

test("different refs", () => {
  const ref1 = jest.fn();
  const ref2 = React.createRef();
  const merged = mergeProps({ a: "a", ref: ref1 }, { ref: ref2 });
  merged.ref("a");
  expect(ref1).toBeCalledWith("a");
  expect(ref2.current).toBe("a");
});

test("className", () => {
  const className1 = "a";
  const className2 = "b";
  const merged = mergeProps(
    { a: "a", className: className1 },
    { className: className2 }
  );
  expect(merged.className).toBe("a b");
  expect(merged.a).toBe("a");
});

test("single function", () => {
  const fn = jest.fn();
  const merged = mergeProps({ a: "a", fn }, { b: "b" });
  expect(merged.a).toBe("a");
  expect(merged.b).toBe("b");
  expect(merged.fn).toBe(fn);
});

test("different functions", () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const merged = mergeProps({ a: "a", fn: fn1 }, { fn: fn2 });
  merged.fn("a");
  expect(fn1).toBeCalledWith("a");
  expect(fn2).toBeCalledWith("a");
});

test("single style", () => {
  const style = { a: "a" };
  const merged = mergeProps({ a: "a", style }, { b: "b" });
  expect(merged.a).toBe("a");
  expect(merged.b).toBe("b");
  expect(merged.style).toBe(style);
  expect(merged.style.a).toBe(style.a);
});

test("different styles", () => {
  const style1 = { a: "a" };
  const style2 = { b: "b" };
  const merged = mergeProps({ a: "a", style: style1 }, { style: style2 });
  expect(merged.a).toBe("a");
  expect(merged.style.a).toBe("a");
  expect(merged.style.b).toBe("b");
});
