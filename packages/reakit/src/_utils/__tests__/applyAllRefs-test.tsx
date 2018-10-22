import * as React from "react";
import { render } from "react-testing-library";
import applyAllRefs from "../applyAllRefs";

test("applyAllRefs", () => {
  const Comp = React.forwardRef<
    HTMLElement,
    { ref1?: React.Ref<any>; ref2?: React.Ref<any>; ref3?: React.Ref<any> }
  >((props, ref) => (
    <div ref={applyAllRefs(ref, props.ref1, props.ref2, props.ref3)} />
  ));

  let element;
  const ref = React.createRef<HTMLDivElement>();
  const ref1 = React.createRef<HTMLDivElement>();
  const ref3 = (el: HTMLDivElement) => {
    element = el;
  };
  render(<Comp ref={ref} ref1={ref1} ref3={ref3} />);
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  expect(ref1.current).toBeInstanceOf(HTMLDivElement);
  expect(element).toBeInstanceOf(HTMLDivElement);
});
