import { MutableRefObject, RefCallback } from "react";
import { As, Options, Props } from "ariakit-react-utils/types";
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
export declare const usePortal: import("ariakit-react-utils/types").Hook<PortalOptions<"div">>;
/**
 * A component that renders an element using `ReactDOM.createPortal`.
 * @see https://ariakit.org/components/portal
 * @example
 * ```jsx
 * <Portal>Content</Portal>
 * ```
 */
export declare const Portal: import("ariakit-react-utils/types").Component<PortalOptions<"div">>;
export declare type PortalOptions<T extends As = "div"> = Options<T> & {
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
    portalRef?: RefCallback<HTMLElement> | MutableRefObject<HTMLElement | null>;
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
    portalElement?: ((element: HTMLElement) => HTMLElement | null) | HTMLElement | null;
};
export declare type PortalProps<T extends As = "div"> = Props<PortalOptions<T>>;
