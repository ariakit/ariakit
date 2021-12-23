import { useContext } from "react";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { CheckboxCheckedContext } from "./__utils";
import { CheckboxState } from "./checkbox-state";

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
    <polyline points="4,8 7,12 12,4"></polyline>
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
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a check mark icon.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckboxCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useCheckboxCheck = createHook<CheckboxCheckOptions>(
  ({ state, checked, ...props }) => {
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
  }
);

/**
 * A component that renders a a check mark icon.
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

export type CheckboxCheckOptions<T extends As = "span"> = Options<T> & {
  /**
   * Object returned by the `useCheckboxState` hook. If not provided, the parent
   * `Checkbox` component's context will be used. If the `checked` prop is
   * provided, it will override this state.
   */
  state?: CheckboxState;
  /**
   * Whether the check mark should be shown. This value is automatically
   * inferred from the `state` prop or the parent `Checkbox` component. Manually
   * setting this prop will override the inferred value.
   */
  checked?: boolean;
};

export type CheckboxCheckProps<T extends As = "span"> = Props<
  CheckboxCheckOptions<T>
>;
