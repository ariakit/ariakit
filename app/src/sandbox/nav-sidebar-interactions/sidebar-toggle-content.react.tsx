import * as Ariakit from "@ariakit/react";
import {
  Sidebar,
  SidebarProvider,
  SidebarToggle,
} from "@ariakit/ui/components/sidebar.ariakit.react";

export function SidebarToggleContent() {
  const store = Ariakit.useDialogStore();
  return (
    <section
      aria-label="Sidebar toggle content"
      className="grid w-[min(52rem,calc(100vw-2rem))] gap-4 sm:grid-cols-2"
    >
      <h2 className="col-span-full">Sidebar toggle content</h2>
      {[
        { name: "Custom", children: <span>Menu</span> },
        { name: "Zero", children: 0 },
        { name: "Fallback", children: undefined },
      ].map(({ name, children }) => (
        <SidebarProvider key={name}>
          <section aria-label={`${name} toggle`} className="grid gap-2">
            <h3>{name} toggle</h3>
            <SidebarToggle className="min-h-8 min-w-8 w-max border">
              {children}
            </SidebarToggle>
            <div className="relative h-32 overflow-clip contain-layout [container-type:size]">
              <Sidebar aria-label={`${name} menu`} render={<aside />}>
                <a href={`#${name.toLowerCase()}`}>{name} settings</a>
                <Ariakit.DialogDismiss>Close {name} menu</Ariakit.DialogDismiss>
              </Sidebar>
            </div>
          </section>
        </SidebarProvider>
      ))}
      <SidebarProvider defaultOpen>
        <section aria-label="Explicit store toggle">
          <h3>Explicit store toggle</h3>
          <SidebarToggle store={store} className="min-h-8 min-w-8 border" />
          <Ariakit.Dialog
            store={store}
            aria-label="Explicit store menu"
            modal={false}
          >
            <a href="#explicit-store">Explicit store settings</a>
            <Ariakit.DialogDismiss>
              Close explicit store menu
            </Ariakit.DialogDismiss>
          </Ariakit.Dialog>
        </section>
      </SidebarProvider>
    </section>
  );
}
