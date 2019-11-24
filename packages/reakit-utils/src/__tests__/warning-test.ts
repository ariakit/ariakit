import { warning } from "../warning";

const initialNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = initialNodeEnv;
});

test('log to console.warn when NODE_ENV is not "production"', () => {
  process.env.NODE_ENV = "development";
  warning(true, "warn", "ing");
  expect(console).toHaveWarnedWith("warn\ning");
});

test('do not log to console.warn if NODE_ENV is "production"', () => {
  process.env.NODE_ENV = "production";
  warning(true, "warn", "ing");
  expect(console).not.toHaveWarned();
});
