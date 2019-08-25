import * as React from "react";
import { HiddenOptions } from "../Hidden";

export function useSetIsMounted(options: HiddenOptions) {
  if (process.env.NODE_ENV === "production") return;

  React.useEffect(() => {
    if (options.unstable_setIsMounted) {
      options.unstable_setIsMounted(true);
    }
    return () => {
      if (options.unstable_setIsMounted) {
        options.unstable_setIsMounted(false);
      }
    };
  }, [options.unstable_setIsMounted]);
}
