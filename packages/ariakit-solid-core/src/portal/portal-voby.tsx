import { type JSX, createRenderEffect } from "solid-js";
import { assign, render } from "solid-js/web";

type Child =
  | null
  | undefined
  | boolean
  | bigint
  | number
  | string
  | symbol
  | Node
  | Array<Child>
  | (() => Child);

type FunctionMaybe<T = unknown> = (() => T) | T;

type ChildWithMetadata<T = unknown> = (() => Child) & { metadata: T };

declare const ObservableSymbol: unique symbol;

type ObservableReadonly<T = unknown> = {
  (): T;
  readonly [ObservableSymbol]: true;
};

type Observable<T = unknown> = {
  (): T;
  (fn: (value: T) => T): T;
  (value: T): T;
  readonly [ObservableSymbol]: true;
};

type ComponentIntrinsicElement = keyof JSX.IntrinsicElements;

type FN<Arguments extends unknown[], Return = void> = (
  ...args: Arguments
) => Return;

const SYMBOL_OBSERVABLE = Symbol("Observable");

const isFunction = (value: unknown): value is Function => {
  return typeof value === "function";
};

const isObservable = <T = unknown>(
  value: unknown,
): value is Observable<T> | ObservableReadonly<T> => {
  return isFunction(value) && SYMBOL_OBSERVABLE in value;
};

const createHTMLNode: FN<[ComponentIntrinsicElement], HTMLElement> =
  document.createElement.bind(document);

function get<T>(value: FunctionMaybe<T>, getFunction?: true): T;
function get<T>(
  value: T,
  getFunction: false,
): T extends ObservableReadonly<infer U> ? U : T;
function get<T>(value: T, getFunction = true) {
  const is = getFunction ? isFunction : isObservable;

  if (is(value)) {
    return value();
  } else {
    return value;
  }
}

export function Portal({
  when = true,
  mount,
  wrapper,
  children,
}: {
  mount?: Child;
  when?: FunctionMaybe<boolean>;
  wrapper?: Child;
  children: Child;
}): ChildWithMetadata<{ portal: HTMLElement }> {
  const container = get(wrapper) || createHTMLNode("div");
  if (!(container instanceof HTMLElement))
    throw new Error("Invalid wrapper node");
  const condition = get(when);
  createRenderEffect(() => {
    if (!get(condition)) return;
    const parent = get(mount) || document.body;
    if (!(parent instanceof Element)) throw new Error("Invalid mount node");
    parent.insertBefore(container, null);
    return (): void => {
      parent.removeChild(container);
    };
  });

  createRenderEffect(() => {
    if (!get(condition)) return;
    return render(children, container);
  });

  return assign(() => get(condition) || children, {
    metadata: { portal: container },
  });
}
