import * as Ariakit from "@ariakit/react";
import type { CSSProperties } from "react";
import { useState } from "react";

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

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Puts the select below the fold so the page is scrolled when it opens,
      which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <BranchSelect />
      <div style={{ height: 900 }} />
    </main>
  );
}
