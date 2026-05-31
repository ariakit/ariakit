import {
  createHook,
  createInstance,
  mergeProps,
  withOptions,
} from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
import type { ValidComponent } from "solid-js";
import { useContext } from "solid-js";
import { CheckboxCheckedContext } from "./checkbox-checked-context.tsx";
import type { CheckboxStore } from "./checkbox-store.ts";

const TagName = "span" satisfies ValidComponent;
type TagName = typeof TagName;

const checkmark = (
  <svg
    display="block"
    fill="none"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={1.5}
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
 * @see https://solid.ariakit.com/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckboxCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export const useCheckboxCheck = createHook<TagName, CheckboxCheckOptions>(
  withOptions(
    { store: undefined, checked: undefined },
    function useCheckboxCheck(props, options) {
      // Stable reference to the incoming props. The returned props object below
      // is reassigned to `props`, so the `children` getter must read from
      // `ownProps` to avoid self-referencing the merged result (the override
      // `get children()` reads back into `getChildren`, which would otherwise
      // read the merged `props.children` and loop).
      const ownProps = props;
      const context = useContext(CheckboxCheckedContext);
      const resolvedChecked = () => options.checked ?? context();
      const children = () =>
        getChildren({
          checked: resolvedChecked(),
          children: ownProps.children,
        });

      // `aria-hidden` sits below the user props (overridable), while `children`
      // and `style` override them, mirroring React's
      // `{ "aria-hidden": true, ...props, children, style }`. The `children`
      // getter must win so an unchecked `CheckboxCheck` with static children
      // renders `null` (hidden) instead of leaking the raw children.
      props = mergeProps({ "aria-hidden": true }, props);
      props = mergeProps(
        {
          get children() {
            return children();
          },
          style: {
            width: "1em",
            height: "1em",
            "pointer-events": "none",
          },
        },
        props,
        ["children"] as Array<keyof typeof props>,
      );

      // Return the reactive proxy, not `removeUndefinedValues(props)`: the
      // latter eagerly snapshots the `children` getter (which tracks the
      // checked context), freezing the check indicator. Solid hooks run once,
      // so the proxy must stay reactive (matching `useCheckbox`).
      return props;
    },
  ),
);

/**
 * Renders a checkmark icon when the
 * [`checked`](https://solid.ariakit.com/reference/checkbox-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside a [`Checkbox`](https://solid.ariakit.com/reference/checkbox)
 * component, the
 * [`checked`](https://solid.ariakit.com/reference/checkbox-check#checked) prop is
 * automatically derived from the context.
 * @see https://solid.ariakit.com/components/checkbox
 * @example
 * ```jsx
 * <CheckboxCheck checked />
 * ```
 */
export const CheckboxCheck = function CheckboxCheck(props: CheckboxCheckProps) {
  const htmlProps = useCheckboxCheck(props);
  return createInstance(TagName, htmlProps);
};

export interface CheckboxCheckOptions<
  _T extends ValidComponent = TagName,
> extends Options {
  /**
   * Object returned by the
   * [`useCheckboxStore`](https://solid.ariakit.com/reference/use-checkbox-store)
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
   *   Combobox](https://solid.ariakit.com/examples/menu-nested-combobox)
   */
  checked?: boolean;
}

export type CheckboxCheckProps<T extends ValidComponent = TagName> = Props<
  T,
  CheckboxCheckOptions<T>
>;
