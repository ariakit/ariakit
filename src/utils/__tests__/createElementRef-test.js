import createElementRef from "../createElementRef";

it("passes element to scope", () => {
  const scope = {};
  createElementRef(scope, "foo")("bar");
  expect(scope.foo).toBe("bar");
});

it("passes element to scope and call another elementRef function", () => {
  const scope = {
    props: {
      elementRef: jest.fn()
    }
  };
  createElementRef(scope, "foo")("bar");
  expect(scope.props.elementRef).toHaveBeenCalledWith("bar");
});
