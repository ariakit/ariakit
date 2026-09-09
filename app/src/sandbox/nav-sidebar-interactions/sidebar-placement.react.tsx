import * as Ariakit from "@ariakit/react";
import {
  Sidebar,
  SidebarProvider,
  SidebarToggle,
} from "@ariakit/ui/components/sidebar.ariakit.react";
import type { SidebarProps } from "@ariakit/ui/components/sidebar.ariakit.react";

interface Placement {
  name: string;
  side?: SidebarProps["side"];
  providerSide?: SidebarProps["side"];
}

const placements: Placement[] = [
  { name: "Default start" },
  { name: "Direct end", side: "end" },
  { name: "Provider end", providerSide: "end" },
  { name: "Override start", providerSide: "end", side: "start" },
];

export function SidebarPlacement() {
  return (
    <section
      aria-label="Sidebar placement"
      className="grid w-[min(52rem,calc(100vw-2rem))] gap-4"
    >
      <h2>Sidebar placement</h2>
      {(["ltr", "rtl"] as const).map((direction) => (
        <div
          key={direction}
          dir={direction}
          className="grid gap-4 sm:grid-cols-2"
        >
          {placements.map(({ name, side, providerSide }) => {
            const label = `${direction.toUpperCase()} ${name}`;
            return (
              <SidebarProvider key={name} side={providerSide}>
                <section aria-label={label} className="grid gap-2">
                  <h3>{label}</h3>
                  <SidebarToggle
                    aria-label={`Toggle ${label}`}
                    render={<button>Toggle panel</button>}
                  />
                  <section
                    aria-label={`${label} canvas`}
                    className="relative h-40 overflow-clip bg-gray-100 contain-layout [container-type:size]"
                  >
                    <Sidebar
                      side={side}
                      dir={direction}
                      aria-label={`${label} panel`}
                      render={<aside />}
                      $maxWidth={40}
                    >
                      <p>{label} content</p>
                      <Ariakit.DialogDismiss>
                        Close {label}
                      </Ariakit.DialogDismiss>
                    </Sidebar>
                  </section>
                </section>
              </SidebarProvider>
            );
          })}
        </div>
      ))}
    </section>
  );
}
