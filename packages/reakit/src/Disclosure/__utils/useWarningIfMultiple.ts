import * as React from "react";
import { warning } from "reakit-utils/warning";
import { DisclosureRegionOptions } from "../DisclosureRegion";

export function useWarningIfMultiple(options: DisclosureRegionOptions) {
  if (process.env.NODE_ENV === "production") return;

  React.useEffect(() => {
    if (!options.baseId) return;

    warning(
      document.querySelectorAll(`#${options.baseId}`).length > 1,
      "[reakit/DisclosureRegion]",
      "You're reusing the same `useModuleState` for multiple components (DisclosureRegion, Dialog, Popover, Menu etc.).",
      "This is not allowed! If you want to use multiple components, make sure you're using different states.",
      "See https://reakit.io/docs/disclosure/#multiple-components"
    );
  }, [options.baseId]);
}
