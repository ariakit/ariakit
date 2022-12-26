import { SyntheticEvent } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const composite = Ariakit.useCompositeStore({ virtualFocus: true });

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
    <Ariakit.Composite store={composite} id="toolbar" role="toolbar" {...props}>
      <Ariakit.CompositeHover as={Ariakit.CompositeItem} id="item-1" {...props}>
        item-1
      </Ariakit.CompositeHover>
      <Ariakit.CompositeHover as={Ariakit.CompositeItem} id="item-2" {...props}>
        item-2
      </Ariakit.CompositeHover>
      <Ariakit.CompositeHover as={Ariakit.CompositeItem} id="item-3" {...props}>
        item-3
      </Ariakit.CompositeHover>
    </Ariakit.Composite>
  );
}
