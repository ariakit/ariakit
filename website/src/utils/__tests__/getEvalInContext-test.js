import getEvalInContext from "../getEvalInContext";

test("getEvalInContext", () => {
  const evalInContext = jest.fn();
  const object = {
    foo: {
      bar: [{ evalInContext }, { evalInContext: jest.fn() }]
    },
    baz: {
      qux: { evalInContext }
    }
  };

  expect(getEvalInContext(object)).toBe(evalInContext);
});
