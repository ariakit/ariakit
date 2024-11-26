import { getDocument } from "@ariakit/core/utils/dom";
import { isFocusEventOutside } from "@ariakit/core/utils/events";
import {
  disableFocusIn,
  getNextTabbable,
  getPreviousTabbable,
  restoreFocusIn,
} from "@ariakit/core/utils/focus";
import { combineProps } from "@solid-primitives/props";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import {
  type JSX,
  Show,
  type ValidComponent,
  createEffect,
  onCleanup,
  useContext,
} from "solid-js";
import { Portal as SolidPortal } from "solid-js/web";
import { FocusTrap } from "../focus-trap/focus-trap.tsx";
import { createRef, stableAccessor, wrapInstance } from "../utils/misc.ts";
import { createHook, createInstance, withOptions } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { PortalContext } from "./portal-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getRootElement(element?: Element | null) {
  return getDocument(element).body;
}

function queueFocus(element?: HTMLElement | null) {
  queueMicrotask(() => {
    element?.focus();
  });
}

/**
 * Returns props to create a `Portal` component.
 * @see https://solid.ariakit.org/components/portal
 * @example
 * ```jsx
 * const props = usePortal();
 * <Role {...props}>Content</Role>
 * ```
 */
export const usePortal = createHook<TagName, PortalOptions>(
  withOptions(
    {
      preserveTabOrder: undefined,
      preserveTabOrderAnchor: undefined,
      portalElement: undefined,
      portalRef: undefined,
      portal: true,
    },
    function usePortal(props, options) {
      // FIXME: create main ref
      const ref = createRef<HTMLType>();
      // FIXME: get context
      const context = useContext(PortalContext);
      // FIXME: create internal portal and anchor portal refs
      const portalNode = createRef<HTMLElement>();
      const anchorPortalNode = createRef<HTMLElement>();

      // FIXME: create positional refs
      const outerBeforeNode = createRef<HTMLSpanElement>();
      const innerBeforeNode = createRef<HTMLSpanElement>();
      const innerAfterNode = createRef<HTMLSpanElement>();
      const outerAfterNode = createRef<HTMLSpanElement>();

      function debugSet(
        { value }: { value: HTMLElement | undefined },
        name: string,
      ) {
        if (value) value.dataset.name = name;
      }
      createEffect(() => {
        debugSet(ref, "ref");
        debugSet(portalNode, "portalNode");
        debugSet(anchorPortalNode, "anchorPortalNode");
        debugSet(outerBeforeNode, "outerBeforeNode");
        debugSet(innerBeforeNode, "innerBeforeNode");
        debugSet(innerAfterNode, "innerAfterNode");
        debugSet(outerAfterNode, "outerAfterNode");
      });

      // Create the anchor portal node and attach it to the DOM.
      createEffect(() => {
        const { portal, preserveTabOrder, preserveTabOrderAnchor } = options;
        if (!portal) return;
        if (!preserveTabOrder) return;
        if (!preserveTabOrderAnchor) return;
        const doc = getDocument(preserveTabOrderAnchor);
        const element = doc.createElement("span");
        element.style.position = "fixed";
        preserveTabOrderAnchor.insertAdjacentElement("afterend", element);
        anchorPortalNode.set(element);
        onCleanup(() => {
          element.remove();
          anchorPortalNode.reset();
        });
      });

      // When preserveTabOrder is true, make sure elements inside the portal
      // element are tabbable only when the portal has already been focused,
      // either by tabbing into a focus trap element outside or using the mouse.
      createEffect(() => {
        const portalNodeValue = portalNode.value;
        const { preserveTabOrder } = options;
        if (!portalNodeValue) return;
        if (!preserveTabOrder) return;
        let raf = 0;
        const onFocus = (event: FocusEvent) => {
          if (!isFocusEventOutside(event)) return;
          const focusing = event.type === "focusin";
          cancelAnimationFrame(raf);
          if (focusing) {
            return restoreFocusIn(portalNodeValue);
          }
          // Wait for the next frame to allow tabindex changes after the focus
          // event.
          raf = requestAnimationFrame(() => {
            disableFocusIn(portalNodeValue, true);
          });
        };
        // Listen to the event on the capture phase so they run before the focus
        // trap elements onFocus prop is called.
        portalNodeValue.addEventListener("focusin", onFocus, true);
        portalNodeValue.addEventListener("focusout", onFocus, true);
        onCleanup(() => {
          cancelAnimationFrame(raf);
          portalNodeValue.removeEventListener("focusin", onFocus, true);
          portalNodeValue.removeEventListener("focusout", onFocus, true);
        });
      });

      props = wrapInstance(props, (wrapperProps) => {
        const baseElement = (children: () => JSX.Element) => (
          // While the portal node is not in the DOM, we need to pass the
          // current context to the portal context, otherwise it's going to
          // reset to the body element on nested portals.
          <PortalContext.Provider value={portalNode.value || context}>
            {children()}
          </PortalContext.Provider>
        );

        const element = () => (
          <SolidPortal
            ref={portalNode.set}
            mount={access(options.portalElement) ?? getRootElement()}
          >
            <Show when={options.preserveTabOrder && portalNode.value}>
              <FocusTrap
                ref={innerBeforeNode.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-before"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode.value)) {
                    queueFocus(getNextTabbable());
                  } else {
                    queueFocus(outerBeforeNode.value);
                  }
                }}
              />
            </Show>
            {baseElement(() => props.children)}
            <Show when={options.preserveTabOrder && portalNode.value}>
              <FocusTrap
                ref={innerAfterNode.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-after"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode.value)) {
                    queueFocus(getPreviousTabbable());
                  } else {
                    queueFocus(outerAfterNode.value);
                  }
                }}
              />
            </Show>
          </SolidPortal>
        );

        let preserveTabOrderElement = () => (
          <>
            <Show when={options.preserveTabOrder && portalNode.value}>
              <FocusTrap
                ref={outerBeforeNode.set}
                data-focus-trap={props.id}
                class="__focus-trap-outer-before"
                onFocus={(event) => {
                  // If the event is coming from the outer after focus trap, it
                  // means there's no tabbable element inside the portal. In
                  // this case, we don't focus the inner before focus trap, but
                  // the previous tabbable element outside the portal.
                  const fromOuter =
                    event.relatedTarget === outerAfterNode.value;
                  if (
                    !fromOuter &&
                    isFocusEventOutside(event, portalNode.value)
                  ) {
                    queueFocus(innerBeforeNode.value);
                  } else {
                    queueFocus(getPreviousTabbable());
                  }
                }}
              />
            </Show>
            <Show when={options.preserveTabOrder}>
              {/* We're using position: fixed here so that the browser doesn't
              add margin to the element when setting gap on a parent element. */}
              <span
                aria-owns={portalNode.value?.id}
                style={{ position: "fixed" }}
              />
            </Show>

            <Show when={options.preserveTabOrder && portalNode.value}>
              <FocusTrap
                ref={outerAfterNode.set}
                data-focus-trap={props.id}
                class="__focus-trap-outer-after"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode.value)) {
                    queueFocus(innerAfterNode.value);
                  } else {
                    const nextTabbable = getNextTabbable();
                    // If the next tabbable element is the inner before focus
                    // trap, this means we're at the end of the document or the
                    // portal was placed right after the original spot in the
                    // React tree. We need to wait for the next frame so the
                    // preserveTabOrder effect can run and disable the inner
                    // before focus trap. If there's no tabbable element after
                    // that, the focus will stay on this element.
                    if (nextTabbable === innerBeforeNode.value) {
                      requestAnimationFrame(() => getNextTabbable()?.focus());
                      return;
                    }
                    queueFocus(nextTabbable);
                  }
                }}
              />
            </Show>
          </>
        );
        preserveTabOrderElement = stableAccessor(
          preserveTabOrderElement,
          (el) => (
            <Show
              when={anchorPortalNode.value && options.preserveTabOrder}
              fallback={el()}
            >
              <SolidPortal mount={anchorPortalNode.value}>{el()}</SolidPortal>
            </Show>
          ),
        );

        return (
          <Show
            when={!options.portal}
            fallback={
              <>
                {preserveTabOrderElement()}
                {element()}
              </>
            }
          >
            {baseElement(() => wrapperProps.children)}
          </Show>
        );
      });

      props = combineProps({ ref: ref.set }, props);

      return props;
    },
  ),
);

/**
 * Renders an element using [React
 * Portal](https://react.dev/reference/react-dom/createPortal).
 *
 * By default, the portal element is a `div` element appended to the
 * `document.body` element. You can customize this with the
 * [`portalElement`](https://solid.ariakit.org/reference/portal#portalelement) prop.
 *
 * The
 * [`preserveTabOrder`](https://solid.ariakit.org/reference/portal#preservetaborder)
 * prop allows this component to manage the tab order of the elements. It
 * ensures the tab order remains consistent with the original location where the
 * portal was rendered in the React tree, instead of the final location in the
 * DOM. The
 * [`preserveTabOrderAnchor`](https://solid.ariakit.org/reference/portal#preservetaborderanchor)
 * prop can specify a different location from which the tab order is preserved.
 * @see https://solid.ariakit.org/components/portal
 * @example
 * ```jsx
 * <Portal>Content</Portal>
 * ```
 */
export const Portal = function Portal(props: PortalProps) {
  const htmlProps = usePortal(props);
  return createInstance(TagName, htmlProps);
};

export interface PortalOptions<_T extends ValidComponent = TagName>
  extends Options {
  /**
   * When enabled, `preserveTabOrder` will keep the DOM element's tab order the
   * same as the order in which the underlying
   * [`Portal`](https://solid.ariakit.org/reference/portal) component was mounted in
   * the React tree.
   *
   * If the
   * [`preserveTabOrderAnchor`](https://solid.ariakit.org/reference/portal#preservetaborderanchor)
   * prop is provided, the tab order will be preserved relative to that element.
   * @default false
   */
  preserveTabOrder?: boolean;
  /**
   * An anchor element for maintaining the tab order when
   * [`preserveTabOrder`](https://solid.ariakit.org/reference/portal#preservetaborder)
   * prop is enabled. The tab order will be kept relative to this element.
   *
   * By default, the tab order is kept relative to the original location in the
   * React tree where the underlying
   * [`Portal`](https://solid.ariakit.org/reference/portal) component was mounted.
   * @example
   * ```jsx {18-20}
   * const [anchor, setAnchor] = useState(null);
   *
   * <button ref={setAnchor}>Order 0</button>
   * <button>Order 2</button>
   *
   * // Rendered at the end of the document.
   * <Portal>
   *   <button>Order 5</button>
   * </Portal>
   *
   * // Rendered at the end of the document, but the tab order is preserved.
   * <Portal preserveTabOrder>
   *   <button>Order 3</button>
   * </Portal>
   *
   * // Rendered at the end of the document, but the tab order is preserved
   * // relative to the anchor element.
   * <Portal preserveTabOrder preserveTabOrderAnchor={anchor}>
   *   <button>Order 1</button>
   * </Portal>
   *
   * <button>Order 4</button>
   * ```
   */
  preserveTabOrderAnchor?: Element | null;
  /**
   * `portalRef` is similar to `ref` but is scoped to the portal node. It's
   * useful when you need to be informed when the portal element is appended to
   * the DOM or removed from the DOM.
   *
   * Live examples:
   * - [Form with Select](https://solid.ariakit.org/examples/form-select)
   * @example
   * ```jsx
   * const [portalElement, setPortalElement] = createSignal();
   *
   * <Portal portalRef={setPortalElement} />
   * ```
   */
  portalRef?: (element?: HTMLElement) => void;
  /**
   * Determines whether the element should be rendered as a React Portal.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://solid.ariakit.org/examples/combobox-filtering-integrated)
   * - [Dialog with Menu](https://solid.ariakit.org/examples/dialog-menu)
   * - [Hovercard with keyboard
   *   support](https://solid.ariakit.org/examples/hovercard-disclosure)
   * - [Menubar](https://solid.ariakit.org/components/menubar)
   * - [Standalone Popover](https://solid.ariakit.org/examples/popover-standalone)
   * - [Animated Select](https://solid.ariakit.org/examples/select-animated)
   * @default true
   */
  portal?: boolean;
  /**
   * An HTML element or a callback function that returns an HTML element to
   * be used as the portal element. By default, the portal element will be a
   * `div` element appended to the `document.body`.
   *
   * Live examples:
   * - [Navigation Menubar](https://solid.ariakit.org/examples/menubar-navigation)
   * @example
   * ```jsx
   * const [portal, setPortal] = createSignal();
   *
   * <Portal portalElement={portal()} />
   * <div ref={setPortal} />
   * ```
   * @example
   * ```jsx
   * const getPortalElement = () => {
   *   const div = document.createElement("div");
   *   const portalRoot = document.getElementById("portal-root");
   *   portalRoot.appendChild(div);
   *   return div;
   * };
   *
   * <Portal portalElement={getPortalElement} />
   * ```
   */
  portalElement?: MaybeAccessor<HTMLElement | undefined>;
}

export type PortalProps<T extends ValidComponent = TagName> = Props<
  T,
  PortalOptions<T>
>;
