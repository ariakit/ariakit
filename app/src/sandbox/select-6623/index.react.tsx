import * as Ariakit from "@ariakit/react";
import { useLayoutEffect, useRef, useState } from "react";

// The app manages the initial focus itself (autoFocusOnShow is disabled on
// the popover below): the recommended option focuses itself as soon as it
// mounts, before the browser paints, so there's no focus flicker. With
// virtualFocus, focusing an option is expected to redirect DOM focus to the
// listbox and mark the option as active. The explicit tabIndex makes the
// option focusable on its very first render, which is required for the
// mount-time focus() call to work.
function RecommendedSelectItem(props: Ariakit.ComboboxItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.focus();
  }, []);
  return <Ariakit.ComboboxItem {...props} ref={ref} tabIndex={-1} />;
}

// The app also focuses the search field on open. It's rendered after the
// options, so its mount focus runs after the recommended option's and wins.
// Focus must stay here: the pending redirect from the option to the listbox
// must be discarded once the option loses focus.
function AutoFocusSearchInput() {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <Ariakit.ComboboxInput ref={ref} type="text" aria-label="Search fruits" />
  );
}

export default function Example() {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={showSearch}
          onChange={(event) => setShowSearch(event.target.checked)}
        />
        Show search
      </label>
      {/* Nothing is selected by default: a stored selection resolves into the
      active item when the popover opens, masking the mount-time focus. */}
      <Ariakit.ComboboxProvider defaultSelectedValue="">
        <Ariakit.ComboboxSelectLabel>
          Favorite fruit
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect />
        <Ariakit.ComboboxPopover
          gutter={4}
          sameWidth
          unmountOnHide
          autoFocusOnShow={false}
        >
          <Ariakit.ComboboxItem value="Apple" />
          <RecommendedSelectItem value="Banana" />
          <Ariakit.ComboboxItem value="Grape" />
          <Ariakit.ComboboxItem value="Orange" />
          {showSearch && <AutoFocusSearchInput />}
        </Ariakit.ComboboxPopover>
      </Ariakit.ComboboxProvider>
    </>
  );
}
