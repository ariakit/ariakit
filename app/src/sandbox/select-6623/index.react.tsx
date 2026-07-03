import * as Ariakit from "@ariakit/react";
import { useLayoutEffect, useRef } from "react";

// The app manages the initial focus itself (autoFocusOnShow is disabled on
// the popover below): the recommended option focuses itself as soon as it
// mounts, before the browser paints, so there's no focus flicker. With
// virtualFocus, focusing an option is expected to redirect DOM focus to the
// listbox and mark the option as active. The explicit tabIndex makes the
// option focusable on its very first render, which is required for the
// mount-time focus() call to work.
function RecommendedSelectItem(props: Ariakit.SelectItemProps) {
  const select = Ariakit.useSelectContext();
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.focus();
  }, []);
  // Workaround: if this option was focused before the select store had a
  // reference to the listbox element, the virtual focus redirect to the
  // listbox was dropped, so we redirect manually once the listbox element is
  // available and DOM focus is still stuck on this option.
  // TODO: Remove once https://github.com/ariakit/ariakit/issues/6623 is
  // fixed.
  const virtualFocus = Ariakit.useStoreState(select, "virtualFocus");
  const baseElement = Ariakit.useStoreState(select, "baseElement");
  useLayoutEffect(() => {
    if (!virtualFocus) return;
    if (!baseElement) return;
    if (document.activeElement !== ref.current) return;
    baseElement.focus();
  }, [virtualFocus, baseElement]);
  return <Ariakit.SelectItem {...props} ref={ref} tabIndex={-1} />;
}

export default function Example() {
  return (
    <Ariakit.SelectProvider defaultValue="Apple">
      <Ariakit.SelectLabel>Favorite fruit</Ariakit.SelectLabel>
      <Ariakit.Select />
      <Ariakit.SelectPopover
        gutter={4}
        sameWidth
        unmountOnHide
        autoFocusOnShow={false}
      >
        <Ariakit.SelectItem value="Apple" />
        <RecommendedSelectItem value="Banana" />
        <Ariakit.SelectItem value="Grape" />
        <Ariakit.SelectItem value="Orange" />
      </Ariakit.SelectPopover>
    </Ariakit.SelectProvider>
  );
}
