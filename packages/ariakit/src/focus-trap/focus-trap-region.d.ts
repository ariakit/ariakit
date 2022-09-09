import { As, Options, Props } from "ariakit-react-utils/types";
/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a focus trap region element.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * const props = useFocusTrapRegion();
 * <Role {...props} />
 * ```
 */
export declare const useFocusTrapRegion: import("ariakit-react-utils/types").Hook<FocusTrapRegionOptions<"div">>;
/**
 * A component that renders a focus trap region element.
 * @see https://ariakit.org/components/focus-trap-region
 * @example
 * ```jsx
 * <FocusTrapRegion>
 *  <Button>click me</Button>
 *  <Button>trap focus</Button>
 *  <Button disabled>disabled Button</Button>
 * </FocusTrapRegion>
 * ```
 */
export declare const FocusTrapRegion: import("ariakit-react-utils/types").Component<FocusTrapRegionOptions<"div">>;
export declare type FocusTrapRegionOptions<T extends As = "div"> = Options<T> & {
    /**
     * If true, it will trap the focus in the region.
     * @default false
     */
    enabled?: boolean;
};
export declare type FocusTrapRegionProps<T extends As = "div"> = Props<FocusTrapRegionOptions<T>>;
