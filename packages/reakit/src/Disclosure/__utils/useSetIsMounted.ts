import * as React from "react";
import { DisclosureContentOptions } from "../DisclosureContent";

export function useSetIsMounted(options: DisclosureContentOptions) {
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
