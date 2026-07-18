import * as ak from "@ariakit/react";
import { click, q, render } from "@ariakit/test/react";
import { expect, test } from "vitest";
import { Sidebar, SidebarProvider, SidebarToggle } from "./sidebar.react.tsx";

function DialogOpenProbe() {
  const store = ak.useDialogContext();
  const open = ak.useStoreState(store, "open");
  return <div data-testid="dialog-open">{String(open)}</div>;
}

// Regression coverage: any ancestor DialogProvider once flagged the sidebar
// as collapsible, so it rendered a dialog with a controlled open prop that
// forced the unrelated dialog store permanently open.
test("does not hijack an unrelated dialog provider store", async () => {
  const { unmount } = await render(
    <ak.DialogProvider>
      <Sidebar>sidebar content</Sidebar>
      <DialogOpenProbe />
    </ak.DialogProvider>,
  );
  expect(
    document.querySelector("[data-testid='dialog-open']"),
  ).toHaveTextContent("false");
  unmount();
});

// Regression coverage: the collapsible sidebar passed an unconditional
// controlled open prop, so the SidebarProvider store could never hide it and
// the toggle's aria-expanded desynced from the visible state.
test("sidebar provider store hides and shows the sidebar", async () => {
  await render(
    <SidebarProvider defaultOpen>
      <Sidebar>sidebar content</Sidebar>
      <SidebarToggle />
    </SidebarProvider>,
  );
  expect(q.dialog()).toBeInTheDocument();
  await click(q.button());
  expect(q.dialog()).not.toBeInTheDocument();
  expect(q.button()).toHaveAttribute("aria-expanded", "false");
});
