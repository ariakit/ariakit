/**
 * Any object.
 */
export declare type AnyObject = Record<keyof any, any>;
/**
 * Any function.
 */
export declare type AnyFunction = (...args: any) => any;
/**
 * Workaround for variance issues.
 * @template T The type of the callback.
 */
export declare type BivariantCallback<T extends AnyFunction> = {
    bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}["bivarianceHack"];
/**
 * @template T The state type.
 */
export declare type SetStateAction<T> = T | BivariantCallback<(prevState: T) => T>;
/**
 * The type of the `setState` function in `[state, setState] = useState()`.
 * @template T The type of the state.
 */
export declare type SetState<T> = BivariantCallback<(value: SetStateAction<T>) => void>;
/**
 * A boolean value or a callback that returns a boolean value.
 * @template T The type of the callback parameter.
 */
export declare type BooleanOrCallback<T> = boolean | BivariantCallback<(arg: T) => boolean>;
/**
 * A string that will provide autocomplete for specific strings.
 * @template T The specific strings.
 */
export declare type StringWithValue<T extends string> = T | (string & {
    [key in symbol]: never;
});
