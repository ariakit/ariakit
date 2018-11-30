import * as React from "react";
import { UseComponent } from "reuse";

interface Props {
  elementRef?: React.Ref<any>;
}

function hoist<P extends Props>(
  Comp: React.ComponentType<P>,
  Base: UseComponent<any>
) {
  const Component = (React.forwardRef((props, ref) => (
    <Comp {...props} elementRef={ref} />
  )) as unknown) as UseComponent<typeof Comp>;
  Component.uses = Base.uses;
  return Component;
}

export default hoist;
