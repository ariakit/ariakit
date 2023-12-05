import type { ReactElement } from "react";
import { StrictMode } from "react";
import * as ReactTestingLibrary from "@testing-library/react";
import { flushMicrotasks, nextFrame, wrapAsync } from "./__utils.js";

export * from "./index.js";

export interface RenderOptions
  extends Omit<ReactTestingLibrary.RenderOptions, "queries"> {
  strictMode?: boolean;
}

export async function render(ui: ReactElement, options?: RenderOptions) {
  const wrapper = (props: { children: ReactElement }) => {
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
