import "./style.css";
import type { SyntheticEvent } from "react";
import * as Ariakit from "@ariakit/react";

export default function Example() {
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
        .join(" | "),
    );
  };

  const props = {
    onFocus: onEvent,
    onBlur: onEvent,
    onKeyDown: onEvent,
    onKeyUp: onEvent,
  };

  return (
    <Ariakit.CompositeProvider virtualFocus>
      <Ariakit.Composite id="toolbar" role="toolbar" {...props}>
        <Ariakit.CompositeItem id="item-1" {...props}>
          item-1
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem id="item-2" {...props}>
          item-2
        </Ariakit.CompositeItem>
        <Ariakit.CompositeItem id="item-3" {...props}>
          item-3
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}
