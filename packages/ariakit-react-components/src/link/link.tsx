import {
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { disabledFromProps, warnOnce } from "@ariakit/utils";
import type { AnchorHTMLAttributes, ElementType } from "react";
import { useEffect, useRef } from "react";
import { trulyDisabledAttribute } from "../focusable/__utils.ts";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";

const TagName = "a" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

// An anchor without an href is a placeholder, so every attribute that
// describes its destination must be omitted too.
// https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element
const withoutDestination = {
  href: undefined,
  itemProp: undefined,
  target: undefined,
  download: undefined,
  ping: undefined,
  rel: undefined,
  hrefLang: undefined,
  referrerPolicy: undefined,
  type: undefined,
} satisfies AnchorHTMLAttributes<HTMLType>;

/**
 * Returns props to create a `Link` component.
 */
export const useLink = createHook<TagName, LinkOptions>(
  function useLink(props) {
    const { focusable = true } = props;
    const disabled = focusable && disabledFromProps(props);

    if (process.env.NODE_ENV !== "production") {
      const ref = useRef<HTMLType>(null);
      useEffect(() => {
        const element = ref.current;
        if (!element) return;
        if (element.tagName !== "A") {
          warnOnce(
            `Link renders an anchor element. The \`render\` prop received a <${element.localName}> element, which can't be a link. Use Command or Button for elements that perform an action instead.`,
            element,
          );
        }
        if (disabled && element.hasAttribute("href")) {
          warnOnce(
            "This disabled Link still has an `href`. A component can add props " +
              "to the element in the `render` prop, but it can't take one " +
              "away, so the link can still be opened in a new tab, copied " +
              "from the context menu, and listed as a link by assistive " +
              "technology. Pass the URL to `Link` and it withholds it while " +
              "the link is disabled.",
            element,
          );
        }
      });
      props = { ...props, ref: useMergeRefs(ref, props.ref) };
    }

    if (disabled) {
      props = { ...props, ...withoutDestination };
    }

    props = useFocusable<TagName>(props);

    if (disabled) {
      // Link knows its native element before Focusable resolves it from the
      // DOM, so disabled server markup can already expose the right semantics
      // and tab order.
      const tabIndex =
        props.tabIndex ?? (props[trulyDisabledAttribute] ? -1 : 0);
      props = {
        role: "link",
        ...props,
        "aria-disabled": true,
        tabIndex,
        disabled: undefined,
      };
    }

    return props;
  },
);

/**
 * Renders a native link that preserves link semantics while disabled.
 *
 * A disabled link omits its destination so native browser navigation features
 * cannot activate it. Use `accessibleWhenDisabled` to keep it in the tab order.
 * @example
 * ```jsx
 * <Link href={nextPage} disabled={!nextPage}>
 *   Next page
 * </Link>
 * ```
 */
export const Link = forwardRef(function Link(props: LinkProps) {
  const htmlProps = useLink(props);
  return createElement(TagName, htmlProps);
});

export interface LinkOptions<
  T extends ElementType = TagName,
> extends FocusableOptions<T> {
  /**
   * The URL the link points to. When the link is disabled, this URL, related
   * destination attributes, and anchor microdata are omitted from the rendered
   * anchor.
   */
  href?: AnchorHTMLAttributes<HTMLType>["href"];
}

export type LinkProps<T extends ElementType = TagName> = Props<
  T,
  LinkOptions<T>
>;
