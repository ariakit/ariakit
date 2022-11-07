import { SyntheticEvent } from "react";
import {
  Composite,
  CompositeHover,
  CompositeItem,
  useCompositeStore,
} from "ariakit/composite/store";
import "./style.css";

export default function Example() {
  const composite = useCompositeStore({ virtualFocus: true });

  const onEvent = (event: SyntheticEvent) => {
    const target = event.target as HTMLElement;
    const relatedTarget = (event as any).relatedTarget as HTMLElement | null;
    console.log(
      [
        `event: ${event.type}`,
        `currentTarget: ${event.currentTarget.id}`,
        `target: ${target.id}`,
        relatedTarget?.id ? `relatedTarget: ${relatedTarget.id}` : undefined,
      ]
        .filter(Boolean)
        .join(" | ")
    );
  };

  const props = {
    onMouseEnter: onEvent,
    onFocus: onEvent,
    onBlur: onEvent,
    onKeyDown: onEvent,
    onKeyUp: onEvent,
  };

  return (
    <Composite store={composite} id="toolbar" role="toolbar" {...props}>
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
