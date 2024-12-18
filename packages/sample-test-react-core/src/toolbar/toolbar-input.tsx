import type { ElementType } from "react";
import {
  createElement,
  createHook,
  forwardRef,
  memo,
} from "../utils/system.tsx";
import type { Props } from "../utils/types.ts";
import { useToolbarContext } from "./toolbar-context.tsx";
import type { ToolbarItemOptions } from "./toolbar-item.tsx";
import { useToolbarItem } from "./toolbar-item.tsx";

const TagName = "input" satisfies ElementType;
type TagName = typeof TagName;

/**
 * Returns props to create a `ToolbarInput` component.
 * @see https://ariakit.org/components/toolbar
 * @deprecated Use `useToolbarItem` instead.
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarInput({ store });
 * <Toolbar store={store}>
 *   <Role {...props} />
 * </Toolbar>
 * ```
 */
export const useToolbarInput = createHook<TagName, ToolbarInputOptions>(
  function useToolbarInput({ store, ...props }) {
    const context = useToolbarContext();
    store = store || context;
    props = useToolbarItem<TagName>({ store, ...props });
    return props;
  },
);

/**
 * Renders a text input as a toolbar item, maintaining arrow key navigation on
 * the toolbar.
 * @see https://ariakit.org/components/toolbar
 * @deprecated Use `<ToolbarItem render={<input />}>` instead.
 * @example
 * ```jsx {2}
 * <Toolbar>
 *   <ToolbarInput />
 * </Toolbar>
 * ```
 */
export const ToolbarInput = memo(
  forwardRef(function ToolbarInput(props: ToolbarInputProps) {
    const htmlProps = useToolbarInput(props);
    return createElement(TagName, htmlProps);
  }),
);

export interface ToolbarInputOptions<T extends ElementType = TagName>
  extends ToolbarItemOptions<T> {}

export type ToolbarInputProps<T extends ElementType = TagName> = Props<
  T,
  ToolbarInputOptions<T>
>;
