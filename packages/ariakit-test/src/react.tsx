import * as ReactTestingLibrary from "@testing-library/react";
import type { ReactNode } from "react";
import { StrictMode } from "react";
import { flushMicrotasks, nextFrame, wrapAsync } from "./__utils.ts";

export * from "./index.ts";

export interface RenderOptions
  extends Omit<ReactTestingLibrary.RenderOptions, "queries"> {
  strictMode?: boolean;
}

export async function render(ui: ReactNode, options?: RenderOptions) {
  const wrapper = (props: { children: ReactNode }) => {
    const Wrapper = options?.wrapper;
    const element = Wrapper ? <Wrapper {...props} /> : props.children;
    if (!options?.strictMode) return element;
    return <StrictMode>{element}</StrictMode>;
  };

  return wrapAsync(async () => {
    const { unmount } = ReactTestingLibrary.render(ui, { ...options, wrapper });
    await flushMicrotasks();
    await nextFrame();
    await flushMicrotasks();
    return unmount;
  });
}
