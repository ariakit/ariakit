import { useStoreProvider } from "ariakit-utils/store";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { PlaygroundContext } from "./__utils/playground-context";
import { PlaygroundState } from "./playground-state";

export const usePlayground = createHook<PlaygroundOptions>(
  ({ state, ...props }) => {
    props = useStoreProvider({ state, ...props }, PlaygroundContext);
    props = {
      suppressHydrationWarning: true,
      ...props,
    };
    return props;
  }
);

export const Playground = createComponent<PlaygroundOptions>((props) => {
  const htmlProps = usePlayground(props);
  return createElement("div", htmlProps);
});

export type PlaygroundOptions<T extends As = "div"> = Options<T> & {
  state: PlaygroundState;
};

export type PlaygroundProps<T extends As = "div"> = Props<PlaygroundOptions<T>>;
