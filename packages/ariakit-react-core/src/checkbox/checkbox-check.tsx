import { useContext } from "react";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import { CheckboxCheckedContext } from "./checkbox-checked-context.js";
import type { CheckboxStore } from "./checkbox-store.js";

const checkmark = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5pt"
    viewBox="0 0 16 16"
    height="1em"
    width="1em"
  >
    <polyline points="4,8 7,12 12,4" />
  </svg>
);

function getChildren(props: Pick<CheckboxCheckProps, "checked" | "children">) {
  if (props.checked) {
    return props.children || checkmark;
  }
  if (typeof props.children === "function") {
    return props.children;
  }
  return null;
}

/**
 * Returns props to create a `CheckboxCheck` component, that's usually rendered
 * inside a `Checkbox` component.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckboxCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useCheckboxCheck = createHook<CheckboxCheckOptions>(
  ({ store, checked, ...props }) => {
    const context = useContext(CheckboxCheckedContext);
    checked = checked ?? context;
    const children = getChildren({ checked, children: props.children });

    props = {
      "aria-hidden": true,
      ...props,
      children,
      style: {
        width: "1em",
        height: "1em",
        pointerEvents: "none",
        ...props.style,
      },
    };

    return props;
  },
);

/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/checkbox-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside a [`Checkbox`](https://ariakit.org/reference/checkbox)
 * component, the
 * [`checked`](https://ariakit.org/reference/checkbox-check#checked) prop is
 * automatically derived from the context.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <CheckboxCheck checked />
 * ```
 */
export const CheckboxCheck = createComponent<CheckboxCheckOptions>((props) => {
  const htmlProps = useCheckboxCheck(props);
  return createElement("span", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  CheckboxCheck.displayName = "CheckboxCheck";
}

export interface CheckboxCheckOptions<T extends As = "span">
  extends Options<T> {
  /**
   * Object returned by the
   * [`useCheckboxStore`](https://ariakit.org/reference/use-checkbox-store)
   * hook.
   */
  store?: CheckboxStore;
  /**
   * Determines if the checkmark should be rendered. This value is automatically
   * derived from the context when it exists. Manually setting this prop will
   * supersede the derived value.
   *
   * Live examples:
   * - [Submenu with
   *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
   */
  checked?: boolean;
}

export type CheckboxCheckProps<T extends As = "span"> = Props<
  CheckboxCheckOptions<T>
>;
