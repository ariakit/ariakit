import type { ReactNode } from "react";
import { StrictMode } from "react";
import type { RenderOptions as BaseRenderOptions } from "./__dom/render.ts";
import { render as baseRender } from "./__dom/render.ts";
import { flushMicrotasks, nextFrame, wrapAsync } from "./__utils.ts";

export * from "./index.ts";

/**
 * Options for the `render` function. Accepts the standard DOM render options
 * (`container`, `baseElement`, `wrapper`, `hydrate`, and so on, except
 * `queries`), plus `strictMode` to wrap the rendered UI in React's `StrictMode`.
 * @example
 * ```tsx
 * const options: RenderOptions = { strictMode: true };
 * await render(<App />, options);
 * ```
 */
export interface RenderOptions extends Omit<BaseRenderOptions, "queries"> {
  strictMode?: boolean;
}

function wrapRender<T extends (...args: any[]) => any>(
  renderFn: T,
): Promise<ReturnType<T>> {
  return wrapAsync(async () => {
    const output: ReturnType<T> = renderFn();
    await flushMicrotasks();
    await nextFrame();
    await flushMicrotasks();
    return output;
  });
}

/**
 * Renders a React element into the document for testing, waiting for effects and
 * the next frame to flush before resolving.
 *
 * It returns `unmount` to remove the tree and an async `rerender` to update it
 * with new UI. Pass `strictMode: true` to wrap the element in React's
 * `StrictMode`, or any other supported render option.
 * @example
 * ```tsx
 * const { rerender, unmount } = await render(<Button>Submit</Button>);
 * await click(q.button("Submit"));
 * await rerender(<Button>Sent</Button>);
 * unmount();
 * ```
 */
export async function render(ui: ReactNode, options?: RenderOptions) {
  const { strictMode, wrapper: Wrapper, ...renderOptions } = options ?? {};
  const wrapper = (props: { children: ReactNode }) => {
    const element = Wrapper ? <Wrapper {...props} /> : props.children;
    if (!strictMode) return element;
    return <StrictMode>{element}</StrictMode>;
  };

  return wrapRender(() => {
    const { unmount, rerender } = baseRender(ui, {
      ...renderOptions,
      wrapper,
    });
    return {
      unmount,
      rerender: (newUi: ReactNode) => wrapRender(() => rerender(newUi)),
    };
  });
}
