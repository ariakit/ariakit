import { getDocument } from "@ariakit/core/utils/dom";
import { isFocusEventOutside } from "@ariakit/core/utils/events";
import {
  disableFocusIn,
  getNextTabbable,
  getPreviousTabbable,
  restoreFocusIn,
} from "@ariakit/core/utils/focus";
import { combineProps } from "@solid-primitives/props";
import { mergeRefs } from "@solid-primitives/refs";
import {
  type JSX,
  Match,
  Show,
  Switch,
  type ValidComponent,
  createEffect,
  onCleanup,
} from "solid-js";
import { FocusTrap } from "../focus-trap/focus-trap.tsx";
import { createRef, wrapInstance } from "../utils/misc.ts";
import { createHook, createInstance, withOptions } from "../utils/system.tsx";
import type { Options, Props } from "../utils/types.ts";
import { Portal as SolidPortal } from "./portal-solid.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

function getRootElement(element?: Element | null) {
  return getDocument(element).body;
}

function getPortalElement(
  element: HTMLElement,
  portalElement: PortalOptions["portalElement"],
) {
  if (!portalElement) {
    return getDocument(element).createElement("div");
  }
  // TODO: (react) shouldn't this fall back to the return above as well?
  if (typeof portalElement === "function") {
    return portalElement(element);
  }
  return portalElement;
}

function getRandomId(prefix = "id") {
  return `${prefix ? `${prefix}-` : ""}${Math.random()
    .toString(36)
    .substr(2, 6)}`;
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
      ref: undefined,
    },
    function usePortal(props, options) {
      const ref = createRef<HTMLType>();
      const refProp = mergeRefs(ref.set, options.ref, (element) => {
        // Since the wrapper div element is created by Solid, there is no
        // way to forward the props to it. We set the id manually here,
        // as other features depend on it.
        // TODO: ensure this is actually true
        if (props.id) element.id = props.id;
      });
      const portalNode = createRef<HTMLElement>();

      const outerBeforeRef = createRef<HTMLSpanElement>();
      const innerBeforeRef = createRef<HTMLSpanElement>();
      const innerAfterRef = createRef<HTMLSpanElement>();
      const outerAfterRef = createRef<HTMLSpanElement>();

      // Create the portal node and attach it to the DOM.
      createEffect(() => {
        const element = ref.current;
        if (!element || !options.portal) {
          portalNode.reset();
          return;
        }
        const portalEl = getPortalElement(element, options.portalElement);
        // TODO: (original) Warn about portals as the document.body element.
        if (!portalEl) {
          portalNode.reset();
          return;
        }
        const isPortalInDocument = portalEl.isConnected;
        if (!isPortalInDocument) {
          // TODO: add context support?
          // const rootElement = context ?? getRootElement(element);
          const rootElement = getRootElement(element);
          rootElement.append(portalEl);
        }
        // If the portal element doesn't have an id already, set one.
        if (!portalEl.id) {
          // Use the element's id so rendering <Portal id="some-id" /> will
          // produce predictable results.
          portalEl.id =
            // TODO: added options.portalElement check for parity with observed
            // behavior in Ariakit React, but is this necessary?
            element.id && !options.portalElement
              ? `portal/${element.id}`
              : getRandomId();
        }
        // Set the internal portal node state and the portalRef prop.
        portalNode.set(portalEl);
        options.portalRef?.(portalEl);
        // If the portal element was already in the document, we don't need to
        // remove it when the element is unmounted, so we just return.
        if (isPortalInDocument) return;
        // Otherwise, we need to remove the portal from the DOM.
        onCleanup(() => {
          portalEl.remove();
          options.portalRef?.(undefined);
        });
      });

      // When preserveTabOrder is true, make sure elements inside the portal
      // element are tabbable only when the portal has already been focused,
      // either by tabbing into a focus trap element outside or using the mouse.
      createEffect(() => {
        const { value: portalNodeEl } = portalNode;
        if (!portalNodeEl) return;
        if (!options.preserveTabOrder) return;
        let raf = 0;
        const onFocus = (event: FocusEvent) => {
          if (!isFocusEventOutside(event)) return;
          const focusing = event.type === "focusin";
          cancelAnimationFrame(raf);
          if (focusing) {
            return restoreFocusIn(portalNodeEl);
          }
          // Wait for the next frame to allow tabindex changes after the focus
          // event.
          raf = requestAnimationFrame(() => {
            disableFocusIn(portalNodeEl, true);
          });
        };
        // Listen to the event on the capture phase so they run before the focus
        // trap elements onFocus prop is called.
        portalNodeEl.addEventListener("focusin", onFocus, true);
        portalNodeEl.addEventListener("focusout", onFocus, true);
        onCleanup(() => {
          cancelAnimationFrame(raf);
          portalNodeEl.removeEventListener("focusin", onFocus, true);
          portalNodeEl.removeEventListener("focusout", onFocus, true);
        });
      });

      props = wrapInstance(props, (wrapperProps) => {
        // TODO: add context support

        const withPreserveTabOrder = (children: () => JSX.Element) => (
          <>
            <Show when={options.preserveTabOrder && portalNode.current}>
              <FocusTrap
                ref={innerBeforeRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-before"
                onFocus={(event) => {
                  queueMicrotask(() => {
                    if (isFocusEventOutside(event, portalNode.current)) {
                      queueFocus(getNextTabbable());
                    } else {
                      queueFocus(outerBeforeRef.current);
                    }
                  });
                }}
              />
            </Show>
            {children()}
            <Show when={options.preserveTabOrder && portalNode.current}>
              <FocusTrap
                ref={innerAfterRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-after"
                onFocus={(event) => {
                  queueMicrotask(() => {
                    if (isFocusEventOutside(event, portalNode.current)) {
                      queueFocus(getPreviousTabbable());
                    } else {
                      queueFocus(outerAfterRef.current);
                    }
                  });
                }}
              />
            </Show>
          </>
        );

        const preserveTabOrderElement = () => (
          <>
            <Show when={options.preserveTabOrder && portalNode.current}>
              <FocusTrap
                ref={outerBeforeRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-outer-before"
                onFocus={(event) => {
                  // If the event is coming from the outer after focus trap, it
                  // means there's no tabbable element inside the portal. In
                  // this case, we don't focus the inner before focus trap, but
                  // the previous tabbable element outside the portal.
                  const fromOuter =
                    event.relatedTarget === outerAfterRef.current;
                  if (
                    !fromOuter &&
                    isFocusEventOutside(event, portalNode.current)
                  ) {
                    queueFocus(innerBeforeRef.current);
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
                aria-owns={portalNode.current?.id}
                style={{ position: "fixed" }}
              />
            </Show>
            <Show when={options.preserveTabOrder && portalNode.current}>
              <FocusTrap
                ref={outerAfterRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-outer-after"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode.current)) {
                    queueFocus(innerAfterRef.current);
                  } else {
                    const nextTabbable = getNextTabbable();
                    // If the next tabbable element is the inner before focus
                    // trap, this means we're at the end of the document or the
                    // portal was placed right after the original spot in the
                    // React tree. We need to wait for the next frame so the
                    // preserveTabOrder effect can run and disable the inner
                    // before focus trap. If there's no tabbable element after
                    // that, the focus will stay on this element.
                    if (nextTabbable === innerBeforeRef.current) {
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

        return (
          <Switch>
            <Match when={!options.portal}>{wrapperProps.children}</Match>
            <Match when={!portalNode.value}>
              {/* If the element should be rendered within a portal, but the portal
              node is not yet in the DOM, we'll return an empty div element. We
              assign the id to the element so we can use it to set the portal id
              later on. We're using position: fixed here so that the browser
              doesn't add margin to the element when setting gap on a parent
              element. */}
              <span
                ref={refProp}
                id={props.id}
                style={{ position: "fixed" }}
                hidden
              />
            </Match>
            <Match when={portalNode.value}>
              {preserveTabOrderElement()}
              <SolidPortal ref={refProp} mount={portalNode.value}>
                {withPreserveTabOrder(() => props.children)}
              </SolidPortal>
            </Match>
          </Switch>
        );
      });

      props = combineProps(
        {
          // TODO: is this necessary? since when portalled, this won't render anyway right?
          ref: (element: HTMLDivElement) => !options.portal && refProp(element),
        },
        props,
      );

      return props;
    },
  ),
);

/**
 * Renders an element using [Solid
 * Portal](https://docs.solidjs.com/concepts/control-flow/portal).
 *
 * By default, the portal element is a `div` element appended to the
 * `document.body` element. You can customize this with the
 * [`portalElement`](https://solid.ariakit.org/reference/portal#portalelement) prop.
 *
 * The
 * [`preserveTabOrder`](https://solid.ariakit.org/reference/portal#preservetaborder)
 * prop allows this component to manage the tab order of the elements. It
 * ensures the tab order remains consistent with the original location where the
 * portal was rendered in the Solid tree, instead of the final location in the
 * DOM. The
 * [`preserveTabOrderAnchor`](https://solid.ariakit.org/reference/portal#preservetaborderanchor)
 * prop can specify a different location from which the tab order is preserved.
 * @see https://solid.ariakit.org/components/portal
 * @example
 * ```jsx
 * <SolidPortal>Content</SolidPortal>
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
   * [`Portal`](https://solid.ariakit.org/reference/portal) component was instantiated
   * in the Solid tree.
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
   * Solid tree where the underlying
   * [`Portal`](https://solid.ariakit.org/reference/portal) component was instantiated.
   * @example
   * ```jsx {18-20}
   * const [anchor, setAnchor] = createSignal();
   *
   * <button ref={setAnchor}>Order 0</button>
   * <button>Order 2</button>
   *
   * // Rendered at the end of the document.
   * <SolidPortal>
   *   <button>Order 5</button>
   * </SolidPortal>
   *
   * // Rendered at the end of the document, but the tab order is preserved.
   * <SolidPortal preserveTabOrder>
   *   <button>Order 3</button>
   * </SolidPortal>
   *
   * // Rendered at the end of the document, but the tab order is preserved
   * // relative to the anchor element.
   * <SolidPortal preserveTabOrder preserveTabOrderAnchor={anchor()}>
   *   <button>Order 1</button>
   * </SolidPortal>
   *
   * <button>Order 4</button>
   * ```
   */
  preserveTabOrderAnchor?: Element | null;
  // TODO: do the docs make sense given that it might not be possible for the
  // portal element to be removed from the DOM? or to transition from not
  // being in the DOM to being in the DOM?
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
   * <SolidPortal portalRef={setPortalElement} />
   * ```
   */
  // TODO: is "undefined" necessary?
  portalRef?: (element: HTMLElement | undefined) => void;
  /**
   * Determines whether the element should be rendered as a Solid Portal.
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
   * An HTML element or a callback function that returns an HTML element
   * to be used as the portal element. By default, the portal element will
   * be a `div` element appended to the `document.body`.
   *
   * Live examples:
   * - [Navigation Menubar](https://solid.ariakit.org/examples/menubar-navigation)
   * @example
   * ```jsx
   * const [portal, setPortal] = createSignal();
   *
   * <SolidPortal portalElement={portal()} />
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
   * <SolidPortal portalElement={getPortalElement} />
   * ```
   */
  portalElement?: // TODO: is the "null" necessary?
  // TODO: previous callback signature: ((element: HTMLElement) => HTMLElement | null)
  ((element: HTMLElement) => HTMLElement | undefined) | HTMLElement;
}

export type PortalProps<T extends ValidComponent = TagName> = Props<
  T,
  PortalOptions<T>
>;

// TODO: remaining stuff:
// 1. upon refresh in the stackblitz, the order of the portal elements changes. seems
//    to follow a consistent pattern, and doesn't happen on reload. Weird.
// 2. implement preserveTabOrderAnchor
