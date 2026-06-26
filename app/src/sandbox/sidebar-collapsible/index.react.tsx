import * as ak from "@ariakit/react";
import {
  Sidebar,
  SidebarBody,
  SidebarProvider,
  SidebarToggle,
} from "#app/examples/_lib/ariakit/sidebar.react.tsx";

export default function Example() {
  return (
    <div>
      <SidebarProvider defaultOpen>
        <div className="flex gap-2">
          <SidebarToggle style={{ height: 40, width: 40 }} />
          <button type="button">Outside control</button>
        </div>
        <Sidebar aria-label="Primary sidebar">
          <SidebarBody>Sidebar content</SidebarBody>
        </Sidebar>
      </SidebarProvider>

      <ak.DialogProvider defaultOpen>
        <ak.Dialog
          aria-label="Outer dialog"
          autoFocusOnShow={false}
          modal={false}
        >
          <Sidebar>
            <SidebarBody>Nested standalone sidebar content</SidebarBody>
          </Sidebar>
        </ak.Dialog>
      </ak.DialogProvider>
    </div>
  );
}
