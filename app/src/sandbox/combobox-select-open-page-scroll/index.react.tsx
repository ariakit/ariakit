import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

const branches = [
  "main",
  "0.14-stable",
  "16.8.6",
  "builds/facebook-www",
  "devtools-v4-merge",
  "fabric-cleanup",
  "fabric-focus-blur",
  "gh-pages",
  "nativefb-enable-cache",
  "rsckeys",
];

const selectedBranch = "fabric-focus-blur";

const popoverStyle = {
  background: "white",
  border: "1px solid gray",
  display: "flex",
  flexDirection: "column",
  maxHeight: 160,
} satisfies CSSProperties;

/**
 * A searchable branch picker halfway down a long page. Opening it moves DOM
 * focus into the popup while the popup is still at its pre-placement origin,
 * which is when the composite used to scroll the page.
 *
 * Three things have to hold together for that, and the browser test pins each
 * one:
 *
 * - `virtualFocus`, without which the composite never redirects focus to the
 *   composite element, so nothing can scroll the page.
 * - The `Combobox` element rendered inside the popup instead of next to the
 *   select. It's the composite element focus is redirected to, and keeping it
 *   in the popup is what leaves the popup's initial focus unresolved so an
 *   item is focused first.
 * - `unmountOnHide`, so that element only mounts as the popup opens. Without
 *   it the popup is already positioned by then and the bug doesn't reproduce.
 */
function BranchSelect() {
  const [searchValue, setSearchValue] = useState("");
  const matches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchValue.toLowerCase()),
  );
  return (
    <Ariakit.ComboboxProvider
      virtualFocus
      resetValueOnHide
      defaultSelectedValue={selectedBranch}
      setValue={setSearchValue}
    >
      <Ariakit.ComboboxSelectLabel>Branch</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block", width: 260 }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        unmountOnHide
        style={popoverStyle}
      >
        <Ariakit.Combobox
          aria-label="Search branches"
          placeholder="Find a branch"
          style={{ margin: 8 }}
        />
        <Ariakit.ComboboxList
          style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        >
          {matches.map((branch) => (
            <Ariakit.ComboboxItem
              key={branch}
              value={branch}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

/**
 * An option that focuses itself as soon as it mounts, the way an app does when
 * it wants a recommended entry ready for `Enter` without waiting for a paint.
 * It focuses with `preventScroll`, so anything the page does afterwards is the
 * library's own doing.
 *
 * See https://github.com/ariakit/ariakit/issues/6623
 */
function RecommendedItem(props: Ariakit.ComboboxItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  // The explicit tabIndex makes the option focusable on its first render, which
  // the mount-time focus above depends on. autoFocus marks it as the widget's
  // presentation target; it doesn't focus it, because the popup below opts out
  // of initial focus.
  return <Ariakit.ComboboxItem {...props} ref={ref} tabIndex={-1} autoFocus />;
}

interface SelfFocusingBranchSelectProps {
  label: string;
  /**
   * Renders a `ComboboxSelect`, which is the composite element while the popup
   * is unmounted. Without it, nothing is the composite element until the search
   * field inside the popup registers.
   */
  trigger?: boolean;
}

/**
 * The {@link BranchSelect} shape, with an option that focuses itself, in the two
 * arrangements that decide what the composite element is when that focus lands.
 *
 * With a select trigger, the trigger is the composite element while the popup is
 * unmounted and the search field takes over once it mounts. Without one, nothing
 * is the composite element until the search field registers, which is a commit
 * after the option's mount effect has already run.
 *
 * Either way the popup is still at its pre-placement origin when the composite
 * gets its focus back, and the page moves and stays moved.
 *
 * `combobox-select-6623` has the same self-focusing option and does not
 * reproduce this. See https://github.com/ariakit/ariakit/issues/6623
 *
 * Two things keep this distinct from {@link BranchSelect} and must not be
 * "restored" to match it: `autoFocusOnShow={false}`, which lets the option's own
 * mount focus win over the dialog's initial focus, and the absence of
 * `defaultSelectedValue`, which keeps the store from resolving a selected item
 * that would mask that focus.
 */
function SelfFocusingBranchSelect({
  label,
  trigger,
}: SelfFocusingBranchSelectProps) {
  const combobox = Ariakit.useComboboxStore({ virtualFocus: true });
  const setAnchorElement = useCallback(
    (element: HTMLElement | null) => combobox.setAnchorElement(element),
    [combobox],
  );
  return (
    <Ariakit.ComboboxProvider store={combobox} resetValueOnHide>
      {trigger ? (
        <>
          <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
          <Ariakit.ComboboxSelect style={{ display: "block", width: 260 }} />
        </>
      ) : (
        <button
          type="button"
          tabIndex={0}
          ref={setAnchorElement}
          onClick={combobox.show}
        >
          {label}
        </button>
      )}
      <Ariakit.ComboboxPopover
        gutter={4}
        unmountOnHide
        autoFocusOnShow={false}
        style={{ ...popoverStyle, width: 260 }}
      >
        <Ariakit.Combobox
          aria-label={`Search ${label.toLowerCase()} branches`}
          style={{ margin: 8 }}
        />
        <Ariakit.ComboboxList
          style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        >
          {branches.map((branch) =>
            branch === selectedBranch ? (
              <RecommendedItem
                key={branch}
                value={branch}
                style={{ display: "block", padding: "4px 8px" }}
              />
            ) : (
              <Ariakit.ComboboxItem
                key={branch}
                value={branch}
                style={{ display: "block", padding: "4px 8px" }}
              />
            ),
          )}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

/**
 * The {@link BranchSelect} shape without `unmountOnHide`, so the popup stays in
 * the DOM while closed and never finishes positioning until it opens.
 */
function PersistentBranchSelect() {
  return (
    <Ariakit.ComboboxProvider
      virtualFocus
      resetValueOnHide
      defaultSelectedValue={selectedBranch}
    >
      <Ariakit.ComboboxSelectLabel>Persistent</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block", width: 260 }} />
      <Ariakit.ComboboxPopover gutter={4} sameWidth style={popoverStyle}>
        <Ariakit.Combobox
          aria-label="Search persistent branches"
          style={{ margin: 8 }}
        />
        <Ariakit.ComboboxList
          style={{ flex: 1, minHeight: 0, overflow: "auto" }}
        >
          {branches.map((branch) => (
            <Ariakit.ComboboxItem
              key={branch}
              value={branch}
              style={{ display: "block", padding: "4px 8px" }}
            />
          ))}
        </Ariakit.ComboboxList>
      </Ariakit.ComboboxPopover>
    </Ariakit.ComboboxProvider>
  );
}

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Puts the selects below the fold so the page is scrolled when they
      open, which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <BranchSelect />
      <SelfFocusingBranchSelect label="Recommended" trigger />
      <SelfFocusingBranchSelect label="Deferred" />
      <PersistentBranchSelect />
      <div style={{ height: 900 }} />
    </main>
  );
}
