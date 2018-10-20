import getSelector from "../getSelector";
import styled from "../styled";
import use from "../use";

test("throw", () => {
  const Comp = () => null;
  expect(() => getSelector(Comp)).toThrow();
});

test("styled-components", () => {
  const Comp = styled.div``;
  expect(getSelector(Comp)).toEqual(expect.any(String));
});

test("reuse throw", () => {
  const Comp = use("div");
  expect(() => getSelector(Comp)).toThrow();
});

test("reuse styled-components", () => {
  const Base = styled(use("div"))``;
  const Comp = use(Base);
  expect(getSelector(Comp)).toEqual(expect.any(String));
});
