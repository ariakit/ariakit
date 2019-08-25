import * as React from "react";
import { warning } from "reakit-utils/warning";
import { HiddenOptions } from "../Hidden";

export function useWarningIfMultiple(options: HiddenOptions) {
  if (process.env.NODE_ENV === "production") return;

  React.useEffect(() => {
    if (!options.unstable_hiddenId) return;

    warning(
      document.querySelectorAll(`#${options.unstable_hiddenId}`).length > 1,
      "Hidden",
      "You're reusing the same `useModuleState` for multiple components (Hidden, Dialog, Popover, Menu etc.).",
      "This is not allowed! If you want to use multiple components, make sure you're using different states.",
      "See https://reakit.io/docs/hidden/#multiple-components"
    );
  }, [options.unstable_hiddenId]);
}
