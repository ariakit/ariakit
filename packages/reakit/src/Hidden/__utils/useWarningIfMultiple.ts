import * as React from "react";
import { warning } from "reakit-utils/warning";
import { HiddenOptions } from "../Hidden";

export function useWarningIfMultiple(options: HiddenOptions) {
  if (process.env.NODE_ENV === "production") return;

  React.useEffect(() => {
    if (!options.baseId) return;

    warning(
      // TODO
      document.querySelectorAll(`#${options.baseId}`).length > 1,
      "[reakit/Hidden]",
      "You're reusing the same `useModuleState` for multiple components (Hidden, Dialog, Popover, Menu etc.).",
      "This is not allowed! If you want to use multiple components, make sure you're using different states.",
      "See https://reakit.io/docs/hidden/#multiple-components"
    );
  }, [options.baseId]);
}
