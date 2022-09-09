import { AnyFunction, AnyObject, SetStateAction } from "./types";
/**
 * Empty function.
 */
export declare function noop(..._: any[]): any;
/**
 * Compares two objects.
 * @example
 * shallowEqual({ a: "a" }, {}); // false
 * shallowEqual({ a: "a" }, { b: "b" }); // false
 * shallowEqual({ a: "a" }, { a: "a" }); // true
 * shallowEqual({ a: "a" }, { a: "a", b: "b" }); // false
 */
export declare function shallowEqual(a?: AnyObject, b?: AnyObject): boolean;
/**
 * Receives a `setState` argument and calls it with `currentValue` if it's a
 * function. Otherwise return the argument as the new value.
 * @example
 * applyState((value) => value + 1, 1); // 2
 * applyState(2, 1); // 2
 */
export declare function applyState<T>(argument: SetStateAction<T>, currentValue: T | (() => T)): T;
/**
 * Checks whether `arg` is an object or not.
 * @returns {boolean}
 */
export declare function isObject(arg: any): arg is Record<any, unknown>;
/**
 * Checks whether `arg` is empty or not.
 * @example
 * isEmpty([]); // true
 * isEmpty(["a"]); // false
 * isEmpty({}); // true
 * isEmpty({ a: "a" }); // false
 * isEmpty(); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(""); // true
 */
export declare function isEmpty(arg: any): boolean;
/**
 * Checks whether `arg` is a promise or not.
 * @returns {boolean}
 */
export declare function isPromise<T>(arg: T | Promise<T>): arg is Promise<T>;
/**
 * Checks whether `arg` is an integer or not.
 * @example
 * isInteger(1); // true
 * isInteger(1.5); // false
 * isInteger("1"); // true
 * isInteger("1.5"); // false
 */
export declare function isInteger(arg: any): boolean;
/**
 * Checks whether `prop` is an own property of `obj` or not.
 */
export declare function hasOwnProperty<T extends AnyObject>(object: T, prop: keyof any): prop is keyof T;
/**
 * Receives functions as arguments and returns a new function that calls all.
 */
export declare function chain<T>(...fns: T[]): (...args: T extends AnyFunction ? Parameters<T> : never) => void;
/**
 * Returns a string with the truthy values of `args` separated by space.
 */
export declare function cx(...args: Array<string | null | false | undefined>): string | undefined;
/**
 * Removes diatrics from a string.
 * TODO: Check if it works on WebView Android.
 */
export declare function normalizeString(str: string): string;
/**
 * Queues a function to be called at the end of the current event loop.
 */
export declare function queueMicrotask(callback: VoidFunction): void;
