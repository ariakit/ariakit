import { dynamic } from "@solidjs/web";
import type { ValidComponent } from "@solidjs/web";
import { omit } from "solid-js";
import type { Props } from "./types.ts";

/**
 * Renders an element with live props, an optional render callback, and a lazy
 * wrapper. Unlike React elements, Solid JSX has already been instantiated;
 * element substitution therefore uses a callback in this initial contract.
 */
export function createInstance<T extends ValidComponent>(
  Type: T,
  props: Props<T>,
) {
  const rest = omit(props, "render", "wrapInstance");
  const Render = dynamic(() => props.render ?? Type);
  const renderContent = () => <Render {...rest} />;
  const Element = dynamic(() => {
    const wrapInstance = props.wrapInstance;
    return wrapInstance ? () => wrapInstance(renderContent) : renderContent;
  });
  return <Element />;
}
