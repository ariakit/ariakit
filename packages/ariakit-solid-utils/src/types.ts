import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";

export type HTMLProps<T extends ValidComponent> = ComponentProps<T> & {
  [key: `data-${string}`]: unknown;
};

export type RenderProp<T extends ValidComponent> = (
  props: HTMLProps<T>,
) => JSX.Element;

// Solid creates elements eagerly. Defer creation until inside the wrapper so
// providers and cleanup scopes own the rendered subtree.
export type WrapInstance = (element: () => JSX.Element) => JSX.Element;

export interface Options<T extends ValidComponent> {
  render?: RenderProp<T>;
  wrapInstance?: WrapInstance;
}

export type Props<T extends ValidComponent> = HTMLProps<T> & Options<T>;
