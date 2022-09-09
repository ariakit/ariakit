import { Context, ReactElement } from "react";
import { BivariantCallback } from "ariakit-utils/types";
import { Options, Props, WrapElement } from "./types";
declare type StateFilterFn<T> = BivariantCallback<(nextState: T) => unknown>;
declare type StateFilterDeps<T> = Array<StateFilterFn<T> | keyof NonNullable<T>>;
declare type StateFilter<T> = StateFilterDeps<T> | StateFilterFn<T>;
/**
 * Creates a context that can be passed to `useStore` and `useStoreProvider`.
 */
export declare function createStoreContext<T>(): Context<T | undefined>;
/**
 * Creates a type-safe component with the `as` prop, `state` prop,
 * `React.forwardRef` and `React.memo`.
 *
 * @example
 * import { Options, createMemoComponent } from "ariakit-react-utils/store";
 *
 * type Props = Options<"div"> & {
 *   state?: { customProp: boolean };
 * };
 *
 * const Component = createMemoComponent<Props>(
 *   ({ state, ...props }) => <div {...props} />
 * );
 *
 * <Component as="button" state={{ customProp: true }} />
 */
export declare function createMemoComponent<O extends Options & {
    state?: unknown;
}>(render: (props: Props<O>) => ReactElement, propsAreEqual?: (prev: Props<O>, next: Props<O>) => boolean): import("./types").Component<O>;
/**
 * Returns props with a `wrapElement` function that wraps an element with a
 * React Context Provider that provides a store context to consumers.
 * @example
 * import * as React from "react";
 * import { useStoreProvider } from "ariakit-react-utils/store";
 *
 * const StoreContext = createStoreContext();
 *
 * function Component({ state, ...props }) {
 *   const { wrapElement } = useStoreProvider({ state, ...props }, StoreContext);
 *   return wrapElement(<div {...props} />);
 * }
 */
export declare function useStoreProvider<P, S>({ state, ...props }: P & {
    state?: S;
    wrapElement?: WrapElement;
}, context: Context<S>): Omit<P & {
    state?: S | undefined;
    wrapElement?: WrapElement | undefined;
}, "state"> & {
    wrapElement: WrapElement;
};
/**
 * Adds publishing capabilities to state so it can be passed to `useStore` or
 * `useStoreProvider` later.
 * @example
 * import { useStorePublisher } from "ariakit-react-utils/store";
 *
 * function useComponentState() {
 *   const state = React.useMemo(() => ({ a: "a" }), []);
 *   return useStorePublisher(state);
 * }
 */
export declare function useStorePublisher<T>(state: T): T;
/**
 * Handles state updates on the state or context state passed as the first
 * argument based on the filter argument.
 * @example
 * import { useStore } from "ariakit-react-utils/store";
 *
 * const ContextState = createContextState();
 *
 * function Component({ state }) {
 *   state = useStore(state || ContextState, ["stateProp"]);
 * }
 */
export declare function useStore<T>(stateOrContext: T | Context<T>, filter?: StateFilter<T>): T;
export {};
