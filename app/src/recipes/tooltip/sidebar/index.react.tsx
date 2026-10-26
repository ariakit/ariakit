import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavLink,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import {
  Tooltip,
  TooltipGroup,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarIcon,
  FolderIcon,
  InboxIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
}

const sections: Section[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
  { id: "contacts", label: "Contacts", icon: UsersIcon },
  { id: "files", label: "Files", icon: FolderIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export default function Example() {
  const [current, setCurrent] = useState("inbox");
  const currentSection = sections.find((section) => section.id === current);
  return (
    <Frame
      $layer
      $lighten
      $border
      $rounded="2xl"
      $p={1}
      $orientation="horizontal"
      className="flex w-[26rem] max-w-full overflow-hidden"
    >
      {/* The links share one tooltip, which slides from link to link. The
          tooltips name icons, so they show at once, and they stay for a moment
          while the pointer crosses the gap to the next link. */}
      <TooltipGroup placement="right" showTimeout={0} hideTimeout={300}>
        <Nav
          aria-label="Main"
          bar
          $cover
          $layer
          $darken={0.5}
          $p={2}
          className="shrink-0 border-e"
        >
          {sections.map((section) => (
            <Tooltip key={section.id} content={section.label}>
              <NavLink
                href={`#${section.id}`}
                aria-label={section.label}
                aria-current={current === section.id ? "page" : undefined}
                onClick={() => setCurrent(section.id)}
              >
                <NavSlot>
                  <section.icon />
                </NavSlot>
              </NavLink>
            </Tooltip>
          ))}
        </Nav>
      </TooltipGroup>
      <div className="grid content-start gap-2 p-6">
        <h2 className="text-lg font-medium">{currentSection?.label}</h2>
        <p className="ak-ink-70 text-sm">
          Hover the icons or move through them with Tab. The tooltip names each
          section.
        </p>
      </div>
    </Frame>
  );
}
