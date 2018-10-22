import * as React from "react";
import { render } from "react-testing-library";
import hoist from "../hoist";
import use from "../../use";

test("forwardRef", () => {
  const Base = use("button");
  class Comp extends React.Component<{ elementRef?: React.Ref<any> }> {
    render() {
      return <Base ref={this.props.elementRef} />;
    }
  }

  const Hoisted = hoist(Comp, Base);
  const ref = React.createRef<HTMLButtonElement>();
  render(<Hoisted ref={ref} />);
  expect(Hoisted.uses).toEqual(["button"]);
  expect(ref.current).toBeInstanceOf(HTMLButtonElement);
});
