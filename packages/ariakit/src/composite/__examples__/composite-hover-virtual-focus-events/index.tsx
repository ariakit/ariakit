import { SyntheticEvent } from "react";
import {
  Composite,
  CompositeHover,
  CompositeItem,
  useCompositeState,
} from "ariakit/composite";
import "./style.css";

export default function Example() {
  const composite = useCompositeState({ virtualFocus: true });

  const onEvent = (event: SyntheticEvent) => {
    const target = event.target as HTMLElement;
    console.log([event.type, event.currentTarget.id, target.id].join(" | "));
  };

  const props = {
    onMouseEnter: onEvent,
    onFocus: onEvent,
    onBlur: onEvent,
    onKeyDown: onEvent,
    onKeyUp: onEvent,
  };

  return (
    <Composite state={composite} id="toolbar" role="toolbar" {...props}>
      <CompositeHover as={CompositeItem} id="item-1" {...props}>
        item-1
      </CompositeHover>
      <CompositeHover as={CompositeItem} id="item-2" {...props}>
        item-2
      </CompositeHover>
      <CompositeHover as={CompositeItem} id="item-3" {...props}>
        item-3
      </CompositeHover>
    </Composite>
  );
}
