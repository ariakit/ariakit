import * as React from "react";
import { mergeProps } from "../mergeProps";

test("single ref", () => {
  const ref = jest.fn();
  const merged = mergeProps({ foo: "foo", ref }, { bar: "bar" });
  expect(merged).toEqual({
    foo: "foo",
    bar: "bar",
    ref
  });
});

test("different refs", () => {
  const ref1 = jest.fn();
  const ref2 = React.createRef();
  const merged = mergeProps({ foo: "foo", ref: ref1 }, { ref: ref2 });
  merged.ref("foo");
  expect(ref1).toBeCalledWith("foo");
  expect(ref2.current).toBe("foo");
});

test("className", () => {
  const className1 = "foo";
  const className2 = "bar";
  const merged = mergeProps(
    { foo: "foo", className: className1 },
    { className: className2 }
  );
  expect(merged).toEqual({
    className: "foo bar",
    foo: "foo"
  });
});

test("single function", () => {
  const fn = jest.fn();
  const merged = mergeProps({ foo: "foo", fn }, { bar: "bar" });
  expect(merged).toEqual({
    foo: "foo",
    bar: "bar",
    fn
  });
});

test("different functions", () => {
  const fn1 = jest.fn();
  const fn2 = jest.fn();
  const merged = mergeProps({ foo: "foo", fn: fn1 }, { fn: fn2 });
  merged.fn("foo");
  expect(fn1).toBeCalledWith("foo");
  expect(fn2).toBeCalledWith("foo");
});

test("single style", () => {
  const style = { foo: "foo" };
  const merged = mergeProps({ foo: "foo", style }, { bar: "bar" });
  expect(merged).toEqual({
    foo: "foo",
    bar: "bar",
    style
  });
});

test("different styles", () => {
  const style1 = { foo: "foo" };
  const style2 = { bar: "bar" };
  const merged = mergeProps({ foo: "foo", style: style1 }, { style: style2 });
  expect(merged).toEqual({
    foo: "foo",
    style: {
      foo: "foo",
      bar: "bar"
    }
  });
});
