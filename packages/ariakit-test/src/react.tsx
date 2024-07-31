import * as ReactTestingLibrary from "@testing-library/react";
import type { ReactNode } from "react";
import { StrictMode } from "react";
import { flushMicrotasks, nextFrame, wrapAsync } from "./__utils.ts";

export * from "./index.ts";

export interface RenderOptions
  extends Omit<ReactTestingLibrary.RenderOptions, "queries"> {
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

export async function render(ui: ReactNode, options?: RenderOptions) {
  const wrapper = (props: { children: ReactNode }) => {
    const Wrapper = options?.wrapper;
    const element = Wrapper ? <Wrapper {...props} /> : props.children;
    if (!options?.strictMode) return element;
    return <StrictMode>{element}</StrictMode>;
  };

  return wrapRender(() => {
    const { unmount, rerender } = ReactTestingLibrary.render(ui, {
      ...options,
      wrapper,
    });
    return {
      unmount,
      rerender: (newUi: ReactNode) => wrapRender(() => rerender(newUi)),
    };
  });
}
