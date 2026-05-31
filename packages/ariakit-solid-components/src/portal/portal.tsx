import {
  createHook,
  createInstance,
  createRef,
  mergeProps,
  withOptions,
  wrapInstance,
} from "@ariakit/solid-utils";
import type { Options, Props } from "@ariakit/solid-utils";
import {
  disableFocusIn,
  getDocument,
  getNextTabbable,
  getPreviousTabbable,
  isFocusEventOutside,
  restoreFocusIn,
} from "@ariakit/utils";
import type { JSX, ValidComponent } from "solid-js";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
} from "solid-js";
import { Portal as SolidPortal } from "solid-js/web";
import { As } from "../as/as.tsx";
import { FocusTrap } from "../focus-trap/focus-trap.tsx";
import { PortalContext } from "./portal-context.tsx";

const TagName = "div" satisfies ValidComponent;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

// Returns the best root element for appending portal nodes. When an element
// is in fullscreen mode, portals must be appended inside the fullscreen
// element instead of document.body so they remain visible.
function getRootElement(element?: Element | null) {
  const doc = getDocument(element);
  const { fullscreenElement } = doc;
  if (fullscreenElement instanceof HTMLElement) {
    return fullscreenElement;
  }
  return doc.body;
}

function getPortalElement(
  element: HTMLElement,
  portalElement: PortalOptions["portalElement"],
) {
  if (!portalElement) {
    return getDocument(element).createElement("div");
  }
  if (typeof portalElement === "function") {
    return portalElement(element);
  }
  return portalElement;
}

function getRandomId(prefix = "id") {
  return `${prefix ? `${prefix}-` : ""}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function queueFocus(element?: HTMLElement | null) {
  queueMicrotask(() => {
    element?.focus();
  });
}

/**
 * Returns props to create a `Portal` component.
 * @see https://solid.ariakit.com/components/portal
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
      const ref = createRef<HTMLType>();
      const context = useContext(PortalContext);
      const [portalNode, setPortalNode] = createSignal<HTMLElement | null>(
        null,
      );
      const [anchorPortalNode, setAnchorPortalNode] =
        createSignal<HTMLElement | null>(null);

      const outerBeforeRef = createRef<HTMLSpanElement | null>(null);
      const innerBeforeRef = createRef<HTMLSpanElement | null>(null);
      const innerAfterRef = createRef<HTMLSpanElement | null>(null);
      const outerAfterRef = createRef<HTMLSpanElement | null>(null);

      // Create the portal node and attach it to the DOM.
      createEffect(() => {
        const element = ref.current;
        if (!element || !options.portal) {
          setPortalNode(null);
          return;
        }
        const portalEl = getPortalElement(element, options.portalElement);
        // TODO: Warn about portals as the document.body element.
        if (!portalEl) {
          setPortalNode(null);
          return;
        }
        const isPortalInDocument = portalEl.isConnected;
        if (!isPortalInDocument) {
          const rootElement = context?.() ?? getRootElement(element);
          rootElement.appendChild(portalEl);
        }
        // If the portal element doesn't have an id already, set one.
        if (!portalEl.id) {
          // Use the element's id so rendering <Portal id="some-id" /> will
          // produce predictable results.
          portalEl.id = element.id ? `portal/${element.id}` : getRandomId();
        }
        // Set the internal portal node state and the portalRef prop. Snapshot
        // `portalRef` so the cleanup notifies the same callback that received
        // the element, even if the prop changes while the portal is mounted.
        const portalRef = options.portalRef;
        setPortalNode(portalEl);
        portalRef?.(portalEl);
        // If the portal element was already in the document, we don't need to
        // remove it when the element is unmounted, so we just return.
        if (isPortalInDocument) return;
        // Otherwise, we need to remove the portal from the DOM.
        onCleanup(() => {
          portalEl.remove();
          portalRef?.(null);
        });
      });

      // Move the portal node when fullscreen state changes so it stays visible.
      createEffect(() => {
        const $portalNode = portalNode();
        if (!$portalNode) return;
        if (context?.()) return;
        if (options.portalElement) return;
        const doc = getDocument($portalNode);
        const onFullscreenChange = () => {
          const rootElement = getRootElement($portalNode);
          if ($portalNode.parentElement !== rootElement) {
            rootElement.appendChild($portalNode);
          }
        };
        // Sync immediately in case fullscreen was entered before this effect
        // ran, which can happen if the portal mounts while already in
        // fullscreen mode.
        onFullscreenChange();
        doc.addEventListener("fullscreenchange", onFullscreenChange);
        onCleanup(() => {
          doc.removeEventListener("fullscreenchange", onFullscreenChange);
        });
      });

      // Create the anchor portal node and attach it to the DOM.
      createEffect(() => {
        if (!options.portal) return;
        if (!options.preserveTabOrder) return;
        const anchor = options.preserveTabOrderAnchor;
        if (!anchor) return;
        const doc = getDocument(anchor);
        const element = doc.createElement("span");
        element.style.position = "fixed";
        anchor.insertAdjacentElement("afterend", element);
        setAnchorPortalNode(element);
        onCleanup(() => {
          element.remove();
          setAnchorPortalNode(null);
        });
      });

      // When preserveTabOrder is true, make sure elements inside the portal
      // element are tabbable only when the portal has already been focused,
      // either by tabbing into a focus trap element outside or using the mouse.
      createEffect(() => {
        const $portalNode = portalNode();
        if (!$portalNode) return;
        if (!options.preserveTabOrder) return;
        let raf = 0;
        const onFocus = (event: FocusEvent) => {
          if (!isFocusEventOutside(event)) return;
          const focusing = event.type === "focusin";
          cancelAnimationFrame(raf);
          if (focusing) {
            return restoreFocusIn($portalNode);
          }
          // Wait for the next frame to allow tabindex changes after the focus
          // event.
          raf = requestAnimationFrame(() => {
            disableFocusIn($portalNode, true);
          });
        };
        // Listen to the event on the capture phase so they run before the focus
        // trap elements onFocus prop is called.
        $portalNode.addEventListener("focusin", onFocus, true);
        $portalNode.addEventListener("focusout", onFocus, true);
        onCleanup(() => {
          cancelAnimationFrame(raf);
          $portalNode.removeEventListener("focusin", onFocus, true);
          $portalNode.removeEventListener("focusout", onFocus, true);
        });
      });

      props = wrapInstance(props, (wrapperProps) => {
        const renderInnerTraps = (children: JSX.Element) => (
          <>
            <Show when={options.preserveTabOrder && portalNode()}>
              <FocusTrap
                ref={innerBeforeRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-before"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode())) {
                    queueFocus(getNextTabbable());
                  } else {
                    queueFocus(outerBeforeRef.current);
                  }
                }}
              />
            </Show>
            {children}
            <Show when={options.preserveTabOrder && portalNode()}>
              <FocusTrap
                ref={innerAfterRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-inner-after"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode())) {
                    queueFocus(getPreviousTabbable());
                  } else {
                    queueFocus(outerAfterRef.current);
                  }
                }}
              />
            </Show>
          </>
        );

        const outerTraps = () => (
          <>
            <Show when={options.preserveTabOrder && portalNode()}>
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
                  if (!fromOuter && isFocusEventOutside(event, portalNode())) {
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
                aria-owns={portalNode()?.id}
                style={{ position: "fixed" }}
              />
            </Show>
            <Show when={options.preserveTabOrder && portalNode()}>
              <FocusTrap
                ref={outerAfterRef.set}
                data-focus-trap={props.id}
                class="__focus-trap-outer-after"
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode())) {
                    queueFocus(innerAfterRef.current);
                  } else {
                    const nextTabbable = getNextTabbable();
                    // If the next tabbable element is the inner before focus
                    // trap, this means we're at the end of the document or the
                    // portal was placed right after the original spot in the
                    // Solid tree. We need to wait for the next frame so the
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
            <Match when={!portalNode()}>
              {/* If the element should be rendered within a portal, but the
              portal node is not yet in the DOM, we'll return an empty span
              element. We assign the id to the element so we can use it to set
              the portal id later on. We're using position: fixed here so that
              the browser doesn't add margin to the element when setting gap on
              a parent element. */}
              <span
                ref={ref.set}
                id={props.id}
                style={{ position: "fixed" }}
                hidden
              />
            </Match>
            <Match when={portalNode()}>
              {/* The outer focus traps live in the original tree position, but
              are portaled to the anchor when a preserveTabOrderAnchor is
              provided, mirroring React's createPortal(preserveTabOrderElement,
              anchorPortalNode). */}
              <Show
                when={anchorPortalNode() && options.preserveTabOrder}
                fallback={outerTraps()}
              >
                <SolidPortal mount={anchorPortalNode()!}>
                  {outerTraps()}
                </SolidPortal>
              </Show>
              {/* The host element and inner focus traps are mounted into the
              portal node. */}
              <SolidPortal mount={portalNode()!}>
                {renderInnerTraps(wrapperProps.children)}
              </SolidPortal>
            </Match>
          </Switch>
        );
      });

      // While the portal node is not in the DOM, we need to pass the current
      // context to the portal context, otherwise it's going to reset to the
      // body element on nested portals. This is the outermost wrapper so the
      // provided value covers the whole subtree.
      props = wrapInstance(
        props,
        <As
          component={PortalContext.Provider}
          value={() => portalNode() ?? context?.()}
        />,
      );

      // Overrides above the user props. When portaled, `createInstance` still
      // renders the host (inside the Solid `Portal`), so its `ref` fires and
      // `ref.current` becomes the in-portal element, which is what the creation
      // effect needs.
      props = mergeProps(
        {
          ref: (element: HTMLType) => {
            ref.set(element);
          },
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
 * [`portalElement`](https://solid.ariakit.com/reference/portal#portalelement)
 * prop.
 *
 * The
 * [`preserveTabOrder`](https://solid.ariakit.com/reference/portal#preservetaborder)
 * prop allows this component to manage the tab order of the elements. It
 * ensures the tab order remains consistent with the original location where the
 * portal was rendered in the Solid tree, instead of the final location in the
 * DOM. The
 * [`preserveTabOrderAnchor`](https://solid.ariakit.com/reference/portal#preservetaborderanchor)
 * prop can specify a different location from which the tab order is preserved.
 * @see https://solid.ariakit.com/components/portal
 * @example
 * ```jsx
 * <Portal>Content</Portal>
 * ```
 */
export const Portal = function Portal(props: PortalProps) {
  const htmlProps = usePortal(props);
  return createInstance(TagName, htmlProps);
};

export interface PortalOptions<
  _T extends ValidComponent = TagName,
> extends Options {
  /**
   * When enabled, `preserveTabOrder` will keep the DOM element's tab order the
   * same as the order in which the underlying
   * [`Portal`](https://solid.ariakit.com/reference/portal) component was
   * mounted in the Solid tree.
   *
   * If the
   * [`preserveTabOrderAnchor`](https://solid.ariakit.com/reference/portal#preservetaborderanchor)
   * prop is provided, the tab order will be preserved relative to that element.
   * @default false
   */
  preserveTabOrder?: boolean;
  /**
   * An anchor element for maintaining the tab order when
   * [`preserveTabOrder`](https://solid.ariakit.com/reference/portal#preservetaborder)
   * prop is enabled. The tab order will be kept relative to this element.
   *
   * By default, the tab order is kept relative to the original location in the
   * Solid tree where the underlying
   * [`Portal`](https://solid.ariakit.com/reference/portal) component was
   * mounted.
   * @example
   * ```jsx {18-20}
   * const [anchor, setAnchor] = createSignal(null);
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
   * <Portal preserveTabOrder preserveTabOrderAnchor={anchor()}>
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
   * - [Form with Select](https://solid.ariakit.com/examples/form-select)
   * @example
   * ```jsx
   * const [portalElement, setPortalElement] = createSignal(null);
   *
   * <Portal portalRef={setPortalElement} />
   * ```
   */
  portalRef?: (element: HTMLElement | null) => void;
  /**
   * Determines whether the element should be rendered as a Solid Portal.
   *
   * Live examples:
   * - [Combobox with integrated
   *   filter](https://solid.ariakit.com/examples/combobox-filtering-integrated)
   * - [Dialog with Menu](https://solid.ariakit.com/examples/dialog-menu)
   * - [Hovercard with keyboard
   *   support](https://solid.ariakit.com/examples/hovercard-disclosure)
   * - [Menubar](https://solid.ariakit.com/components/menubar)
   * - [Standalone Popover](https://solid.ariakit.com/examples/popover-standalone)
   * - [Animated Select](https://solid.ariakit.com/examples/select-animated)
   * @default true
   */
  portal?: boolean;
  /**
   * An HTML element or a callback function that returns an HTML element to be
   * used as the portal element. By default, the portal element will be a `div`
   * element appended to the `document.body`.
   *
   * Live examples:
   * - [Navigation Menubar](https://solid.ariakit.com/examples/menubar-navigation)
   * @example
   * ```jsx
   * const [portal, setPortal] = createSignal(null);
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
  portalElement?:
    | ((element: HTMLElement) => HTMLElement | null)
    | HTMLElement
    | null;
}

export type PortalProps<T extends ValidComponent = TagName> = Props<
  T,
  PortalOptions<T>
>;
