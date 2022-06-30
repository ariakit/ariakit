import {
  MutableRefObject,
  RefCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getDocument } from "ariakit-utils/dom";
import { isFocusEventOutside } from "ariakit-utils/events";
import {
  disableFocusIn,
  getNextTabbable,
  getPreviousTabbable,
  restoreFocusIn,
} from "ariakit-utils/focus";
import {
  useForkRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "ariakit-utils/hooks";
import { setRef } from "ariakit-utils/misc";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { createPortal } from "react-dom";
import { FocusTrap } from "../focus-trap";
import { PortalContext } from "./portal-context";

function getRootElement(element?: Element | null) {
  return getDocument(element).body;
}

function getPortalElement(
  element: HTMLElement,
  portalElement: PortalOptions["portalElement"]
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
    .substr(2, 6)}`;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element using `ReactDOM.createPortal`.
 * @see https://ariakit.org/components/portal
 * @example
 * ```jsx
 * const props = usePortal();
 * <Role {...props}>Content</Role>
 * ```
 */
export const usePortal = createHook<PortalOptions>(
  ({ preserveTabOrder, portalElement, portalRef, portal = true, ...props }) => {
    const ref = useRef<HTMLDivElement>(null);
    const refProp = useForkRef(ref, props.ref);
    const context = useContext(PortalContext);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

    const beforeOutsideRef = useRef<HTMLButtonElement>(null);
    const beforeInsideRef = useRef<HTMLSpanElement>(null);
    const afterInsideRef = useRef<HTMLButtonElement>(null);
    const afterOutsideRef = useRef<HTMLButtonElement>(null);

    // Create the portal node and attach it to the DOM.
    useSafeLayoutEffect(() => {
      const element = ref.current;
      if (!element || !portal) {
        setPortalNode(null);
        return;
      }
      const portalEl = getPortalElement(element, portalElement);
      // TODO: Warn about portals as the document.body element.
      if (!portalEl) {
        setPortalNode(null);
        return;
      }
      const isPortalInDocument = portalEl.isConnected;
      if (!isPortalInDocument) {
        const rootElement = context || getRootElement(element);
        rootElement.appendChild(portalEl);
      }
      // If the portal element doesn't have an id already, set one.
      if (!portalEl.id) {
        // Use the element's id so rendering <Portal id="some-id" /> will
        // produce predictable results.
        portalEl.id = element.id ? `${element.id}-portal` : getRandomId();
      }
      // Set the internal portal node state and the portalRef prop.
      setPortalNode(portalEl);
      setRef(portalRef, portalEl);
      // If the portal element was already in the document, we don't need to
      // remove it when the element is unmounted, so we just return.
      if (isPortalInDocument) return;
      // Otherwise, we need to remove the portal from the DOM.
      return () => {
        portalEl.remove();
        setRef(portalRef, null);
      };
    }, [portal, portalElement, context, portalRef]);

    // When preserveTabOrder is true, make sure elements inside the portal
    // element are tabbable only when the portal has already been focused,
    // either by tabbing into a focus trap element outside or using the mouse.
    useEffect(() => {
      if (!portalNode) return;
      if (!preserveTabOrder) return;
      let raf = 0;
      const onFocus = (event: FocusEvent) => {
        if (isFocusEventOutside(event)) {
          const focusing = event.type === "focusin";
          if (focusing) return restoreFocusIn(portalNode);
          // Wait for the next frame to allow tabindex changes after the focus
          // event.
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => {
            disableFocusIn(portalNode, true);
          });
        }
      };
      // Listen to the event on the capture phase so they run before the focus
      // trap elements onFocus prop is called.
      portalNode.addEventListener("focusin", onFocus, true);
      portalNode.addEventListener("focusout", onFocus, true);
      return () => {
        portalNode.removeEventListener("focusin", onFocus, true);
        portalNode.removeEventListener("focusout", onFocus, true);
      };
    }, [portalNode, preserveTabOrder]);

    props = useWrapElement(
      props,
      (element) => {
        element = (
          // While the portal node is not in the DOM, we need to pass the
          // current context to the portal context, otherwise it's going to
          // reset to the body element on nested portals.
          <PortalContext.Provider value={portalNode || context}>
            {element}
          </PortalContext.Provider>
        );

        if (!portal) return element;

        if (!portalNode) {
          // If the element should be rendered within a portal, but the portal
          // node is not yet in the DOM, we'll return an empty div element. We
          // assign the id to the element so we can use it to set the portal id
          // later on. We're using position: fixed here so that the browser
          // doesn't add margin to the element when setting gap on a parent
          // element.
          return (
            <span ref={refProp} id={props.id} style={{ position: "fixed" }} />
          );
        }

        element = (
          <>
            {preserveTabOrder && portalNode && (
              <FocusTrap
                ref={beforeInsideRef}
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode)) {
                    getNextTabbable()?.focus();
                  } else {
                    beforeOutsideRef.current?.focus();
                  }
                }}
              />
            )}
            {element}
            {preserveTabOrder && portalNode && (
              <FocusTrap
                ref={afterInsideRef}
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode)) {
                    getPreviousTabbable()?.focus();
                  } else {
                    afterOutsideRef.current?.focus();
                  }
                }}
              />
            )}
          </>
        );

        if (portalNode) {
          element = createPortal(element, portalNode);
        }

        element = (
          <>
            {preserveTabOrder && portalNode && (
              <FocusTrap
                ref={beforeOutsideRef}
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode)) {
                    beforeInsideRef.current?.focus();
                  } else {
                    getPreviousTabbable()?.focus();
                  }
                }}
              />
            )}
            {preserveTabOrder && (
              // We're using position: fixed here so that the browser doesn't
              // add margin to the element when setting gap on a parent element.
              <span aria-owns={portalNode?.id} style={{ position: "fixed" }} />
            )}
            {element}
            {preserveTabOrder && portalNode && (
              <FocusTrap
                ref={afterOutsideRef}
                onFocus={(event) => {
                  if (isFocusEventOutside(event, portalNode)) {
                    afterInsideRef.current?.focus();
                  } else {
                    getNextTabbable()?.focus();
                  }
                }}
              />
            )}
          </>
        );

        return element;
      },
      [portalNode, context, portal, props.id, preserveTabOrder]
    );

    props = {
      ...props,
      ref: refProp,
    };

    return props;
  }
);

/**
 * A component that renders an element using `ReactDOM.createPortal`.
 * @see https://ariakit.org/components/portal
 * @example
 * ```jsx
 * <Portal>Content</Portal>
 * ```
 */
export const Portal = createComponent<PortalOptions>((props) => {
  const htmlProps = usePortal(props);
  return createElement("div", htmlProps);
});

export type PortalOptions<T extends As = "div"> = Options<T> & {
  /**
   * When enabled, `preserveTabOrder` will keep the DOM element's tab order the
   * same as the order in which the `Portal` component was mounted in the React
   * tree.
   * @default false
   */
  preserveTabOrder?: boolean;
  /**
   * `portalRef` is similar to `ref` but is scoped to the portal node. It's
   * useful when you need to be informed when the portal element is appended to
   * the DOM or removed from the DOM.
   * @example
   * const [portalElement, setPortalElement] = useState(null);
   * <Portal portalRef={setPortalElement} />;
   */
  portalRef?: RefCallback<HTMLElement> | MutableRefObject<HTMLElement>;
  /**
   * Determines whether the element should be rendered as a React Portal.
   * @default true
   */
  portal?: boolean;
  /**
   * An HTML element or a memoized callback function that returns an HTML
   * element to be used as the portal element. By default, the portal element
   * will be a `div` element appended to the `document.body`.
   * @default HTMLDivElement
   * @example
   * const [portal, setPortal] = useState(null);
   * <Portal portalElement={portal} />;
   * <div ref={setPortal} />;
   * @example
   * const getPortalElement = useCallback(() => {
   *   const div = document.createElement("div");
   *   const portalRoot = document.getElementById("portal-root");
   *   portalRoot.appendChild(div);
   *   return div;
   * }, []);
   * <Portal portalElement={getPortalElement} />;
   */
  portalElement?:
    | ((element: HTMLElement) => HTMLElement | null)
    | HTMLElement
    | null;
};

export type PortalProps<T extends As = "div"> = Props<PortalOptions<T>>;
