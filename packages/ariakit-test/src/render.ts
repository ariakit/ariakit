import { ReactElement, StrictMode } from "react";
import { RenderOptions, render } from "@testing-library/react";

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: StrictMode, ...options });
}

export { customRender as render };
