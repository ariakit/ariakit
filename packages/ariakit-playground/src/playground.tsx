import { useWrapElement } from "@ariakit/react-core/utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "@ariakit/react-core/utils/system";
import type { As, Options, Props } from "@ariakit/react-core/utils/types";
import { PlaygroundContext } from "./__utils/playground-context.js";
import type { PlaygroundStore } from "./playground-store.js";

export const usePlayground = createHook<PlaygroundOptions>(
  ({ store, ...props }) => {
    props = useWrapElement(
      props,
      (element) => (
        <PlaygroundContext.Provider value={store}>
          {element}
        </PlaygroundContext.Provider>
      ),
      [store]
    );
    return props;
  }
);

export const Playground = createComponent<PlaygroundOptions>((props) => {
  const htmlProps = usePlayground(props);
  return createElement("div", htmlProps);
});

export interface PlaygroundOptions<T extends As = "div"> extends Options<T> {
  store: PlaygroundStore;
}

export type PlaygroundProps<T extends As = "div"> = Props<PlaygroundOptions<T>>;
