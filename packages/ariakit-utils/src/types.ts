/**
 * Any object.
 */
export type AnyObject = Record<keyof any, any>;

/**
 * Any function.
 */
export type AnyFunction = (...args: any) => any;

/**
 * Workaround for variance issues.
 * @template T The type of the callback.
 */
export type BivariantCallback<T extends AnyFunction> = {
  bivarianceHack(...args: Parameters<T>): ReturnType<T>;
}["bivarianceHack"];

/**
 * @template T The state type.
 */
export type SetStateAction<T> = T | BivariantCallback<(prevState: T) => T>;

/**
 * The type of the `setState` function in `[state, setState] = useState()`.
 * @template T The type of the state.
 */
export type SetState<T> = BivariantCallback<(value: SetStateAction<T>) => void>;

/**
 * A boolean value or a callback that returns a boolean value.
 * @template T The type of the callback parameter.
 */
export type BooleanOrCallback<T> =
  | boolean
  | BivariantCallback<(arg: T) => boolean>;

/**
 * A string that will provide autocomplete for specific strings.
 * @template T The specific strings.
 */
export type StringWithValue<T extends string> =
  | T
  | (string & { [key in symbol]: never });
