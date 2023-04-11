import type { ReactElement } from "react";
import { StrictMode } from "react";
import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: StrictMode, ...options });
}

export { customRender as render };
