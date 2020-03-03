import * as React from "react";
import { render } from "reakit-test-utils";
import { warning } from "../warning";

const initialNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = initialNodeEnv;
});

test('log to console.warn when NODE_ENV is not "production"', () => {
  process.env.NODE_ENV = "development";
  warning(true, "warn", "ing");
  expect(console).toHaveWarnedWith("warn", "\ning");
});

test("log objects", () => {
  process.env.NODE_ENV = "development";
  const obj = {};
  warning(true, "warn", obj, "ing");
  expect(console).toHaveWarnedWith("warn", obj, "\ning");
});

test("log only when a prop changes in a component", () => {
  process.env.NODE_ENV = "development";
  const Test = ({ a = false }) => {
    warning(a, "warn", "ing");
    return null;
  };
  const { rerender } = render(<Test />);
  expect(console).not.toHaveWarned();
  rerender(<Test a />);
  expect(console).toHaveWarnedWith("warn", "\ning");
  // @ts-ignore
  // eslint-disable-next-line no-console
  expect(console.warn.mock.calls).toHaveLength(1);
  rerender(<Test a />);
  // @ts-ignore
  // eslint-disable-next-line no-console
  expect(console.warn.mock.calls).toHaveLength(1);
  rerender(<Test />);
  // @ts-ignore
  // eslint-disable-next-line no-console
  expect(console.warn.mock.calls).toHaveLength(1);
  rerender(<Test a />);
  // @ts-ignore
  // eslint-disable-next-line no-console
  expect(console.warn.mock.calls).toHaveLength(2);
});

test('do not log to console.warn if NODE_ENV is "production"', () => {
  process.env.NODE_ENV = "production";
  warning(true, "warn", "ing");
  expect(console).not.toHaveWarned();
});
