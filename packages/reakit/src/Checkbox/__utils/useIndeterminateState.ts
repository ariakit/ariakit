import * as React from "react";
import { warning } from "reakit-warning";
import { CheckboxOptions } from "../Checkbox";

export function useIndeterminateState(
  checkboxRef: React.RefObject<any>,
  options: CheckboxOptions
) {
  React.useEffect(() => {
    if (!checkboxRef.current) {
      warning(
        options.state === "indeterminate",
        "Can't set indeterminate state because `ref` wasn't passed to component.",
        "See https://reakit.io/docs/checkbox/#indeterminate-state"
      );
      return;
    }

    if (options.state === "indeterminate") {
      checkboxRef.current.indeterminate = true;
    } else if (checkboxRef.current.indeterminate) {
      checkboxRef.current.indeterminate = false;
    }
  }, [options.state, checkboxRef]);
}
