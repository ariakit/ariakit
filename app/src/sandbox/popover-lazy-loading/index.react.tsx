import * as Ariakit from "@ariakit/react";
import { lazy, Suspense } from "react";

const LazyPopover = lazy(() => import("./lazy-popover.react.tsx"));

export default function Example() {
  const store = Ariakit.usePopoverStore();
  const open = Ariakit.useStoreState(store, "open");
  return (
    <Ariakit.PopoverProvider store={store}>
      <Ariakit.PopoverDisclosure>Accept invite</Ariakit.PopoverDisclosure>
      <Suspense fallback="Loading invitation">
        {open && <LazyPopover />}
      </Suspense>
    </Ariakit.PopoverProvider>
  );
}
