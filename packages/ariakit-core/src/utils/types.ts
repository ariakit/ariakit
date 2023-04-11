/**
 * Any object.
 */
export type AnyObject = Record<string, any>;

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

/**
 * Transforms a type into a primitive type.
 * @template T The type to transform.
 * @example
 * // string
 * ToPrimitive<"a">;
 * // number
 * ToPrimitive<1>;
 */
export type ToPrimitive<T> = T extends string
  ? string
  : T extends number
  ? number
  : T extends boolean
  ? boolean
  : T extends AnyFunction
  ? (...args: Parameters<T>) => ReturnType<T>
  : T;

/**
 * Picks only the properties from a type that have a specific value.
 * @template T The type to pick from.
 * @template Value The value to pick.
 */
export type PickByValue<T, Value> = {
  [K in keyof T as [Value] extends [T[K]]
    ? T[K] extends Value | undefined
      ? K
      : never
    : never]: T[K];
};

/**
 * Picks only the required properties from a type.
 * @template T The type to pick from.
 * @template P The properties to pick.
 */
export type PickRequired<T, P extends keyof T> = T &
  {
    [K in keyof T]: Pick<Required<T>, K>;
  }[P];

/**
 * Indicates the availability and type of interactive popup element, such as
 * menu or dialog, that can be triggered by an element.
 */
export type AriaHasPopup =
  | boolean
  | "false"
  | "true"
  | "menu"
  | "listbox"
  | "tree"
  | "grid"
  | "dialog"
  | undefined;

/**
 * All the WAI-ARIA 1.1 role attribute values from
 * https://www.w3.org/TR/wai-aria-1.1/#role_definitions
 */
export type AriaRole =
  | "alert"
  | "alertdialog"
  | "application"
  | "article"
  | "banner"
  | "button"
  | "cell"
  | "checkbox"
  | "columnheader"
  | "combobox"
  | "complementary"
  | "contentinfo"
  | "definition"
  | "dialog"
  | "directory"
  | "document"
  | "feed"
  | "figure"
  | "form"
  | "grid"
  | "gridcell"
  | "group"
  | "heading"
  | "img"
  | "link"
  | "list"
  | "listbox"
  | "listitem"
  | "log"
  | "main"
  | "marquee"
  | "math"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "navigation"
  | "none"
  | "note"
  | "option"
  | "presentation"
  | "progressbar"
  | "radio"
  | "radiogroup"
  | "region"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "scrollbar"
  | "search"
  | "searchbox"
  | "separator"
  | "slider"
  | "spinbutton"
  | "status"
  | "switch"
  | "tab"
  | "table"
  | "tablist"
  | "tabpanel"
  | "term"
  | "textbox"
  | "timer"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid"
  | "treeitem"
  // eslint-disable-next-line @typescript-eslint/ban-types
  | (string & {});
