import * as Ariakit from "@ariakit/react";
import type { ComponentProps, CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";

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
interface BranchSelectProps {
  label?: string;
  searchLabel?: string;
}

function BranchSelect({
  label = "Branch",
  searchLabel = "Search branches",
}: BranchSelectProps = {}) {
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
      <Ariakit.ComboboxSelectLabel>{label}</Ariakit.ComboboxSelectLabel>
      <Ariakit.ComboboxSelect style={{ display: "block", width: 260 }} />
      <Ariakit.ComboboxPopover
        gutter={4}
        sameWidth
        unmountOnHide
        style={popoverStyle}
      >
        <Ariakit.Combobox
          aria-label={searchLabel}
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

type ComboboxPopoverProps = ComponentProps<typeof Ariakit.ComboboxPopover>;
type UpdatePosition = NonNullable<ComboboxPopoverProps["updatePosition"]>;

function DelayedBranchSelect() {
  const [positioning, setPositioning] = useState(false);
  const delayPositioningRef = useRef(true);
  const positioningPromiseRef = useRef<Promise<void> | null>(null);
  const releasePositioningRef = useRef<() => void>(() => {});

  const updatePosition = useCallback<UpdatePosition>(
    async ({ updatePosition }) => {
      if (delayPositioningRef.current) {
        setPositioning(true);
        positioningPromiseRef.current ??= new Promise<void>((resolve) => {
          releasePositioningRef.current = () => {
            delayPositioningRef.current = false;
            positioningPromiseRef.current = null;
            resolve();
          };
        });
        await positioningPromiseRef.current;
      }
      await updatePosition();
      setPositioning(false);
    },
    [],
  );

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
      <Ariakit.ComboboxProvider
        virtualFocus
        resetValueOnHide
        defaultSelectedValue={selectedBranch}
      >
        <Ariakit.ComboboxSelectLabel>
          Delayed branch
        </Ariakit.ComboboxSelectLabel>
        <Ariakit.ComboboxSelect style={{ display: "block", width: 260 }} />
        <Ariakit.ComboboxPopover
          gutter={4}
          hideOnInteractOutside={false}
          sameWidth
          unmountOnHide
          updatePosition={updatePosition}
          style={popoverStyle}
        >
          <Ariakit.Combobox
            aria-label="Search delayed branches"
            placeholder="Find a branch"
            style={{ margin: 8 }}
          />
          <button
            type="button"
            onClick={(event) => {
              event.currentTarget.focus({ preventScroll: true });
              releasePositioningRef.current();
            }}
          >
            Keep focus and release positioning
          </button>
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
      <div>Positioning: {positioning ? "yes" : "no"}</div>
      <button
        type="button"
        tabIndex={0}
        onClick={() => releasePositioningRef.current()}
      >
        Leave and release positioning
      </button>
    </div>
  );
}

function InlineComposite() {
  return (
    <Ariakit.CompositeProvider
      defaultActiveId="inline-first"
      orientation="vertical"
    >
      <Ariakit.Composite aria-label="Inline actions">
        <Ariakit.CompositeItem id="inline-first">
          Inline first
        </Ariakit.CompositeItem>
        <div style={{ height: 900 }} />
        <Ariakit.CompositeItem id="inline-last">
          Inline last
        </Ariakit.CompositeItem>
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

export default function Example() {
  return (
    <main style={{ display: "grid", gap: 16, justifyItems: "start" }}>
      {/* Puts the select below the fold so the page is scrolled when it opens,
      which is the only way a page jump is observable. */}
      <div style={{ height: 900 }} />
      <BranchSelect />
      <div
        data-testid="branch-scroll-container"
        style={{
          border: "1px solid gray",
          height: 240,
          overflow: "auto",
          width: 320,
        }}
      >
        <div style={{ height: 400 }} />
        <BranchSelect
          label="Nested branch"
          searchLabel="Search nested branches"
        />
        <div style={{ height: 400 }} />
      </div>
      <DelayedBranchSelect />
      <InlineComposite />
      <div style={{ height: 900 }} />
    </main>
  );
}
