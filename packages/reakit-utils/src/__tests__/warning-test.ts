const initialNodeEnv = process.env.NODE_ENV;
const warnSpy = jest.spyOn(global.console, "warn").mockImplementation();

afterEach(() => {
  process.env.NODE_ENV = initialNodeEnv;
  warnSpy.mockRestore();
});

test('log to console.warn when NODE_ENV is not "production"', () => {
  process.env.NODE_ENV = "development";

  jest.isolateModules(() => {
    const { warning } = require("../warning");
    warning(true, "warn", "ing");
  });

  expect(warnSpy).toHaveBeenCalledWith("warn\ning");
});

test('do not log to console.warn if NODE_ENV is "production"', () => {
  process.env.NODE_ENV = "production";

  jest.isolateModules(() => {
    const { warning } = require("../warning");
    warning(true, "warn", "ing");
  });

  expect(warnSpy).not.toHaveBeenCalled();
});
