import { MutableRefObject, RefCallback } from "react";
/**
 * Sets both a function and object React ref.
 */
export declare function setRef<T>(ref: RefCallback<T> | MutableRefObject<T> | null | undefined, value: T): void;
