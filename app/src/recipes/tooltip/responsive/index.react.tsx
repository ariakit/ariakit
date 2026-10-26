import {
  Button,
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import type { LucideIcon } from "lucide-react";
import { DownloadIcon, Share2Icon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface CollapsingButtonProps {
  label: string;
  icon: LucideIcon;
}

function CollapsingButton({ label, icon: Icon }: CollapsingButtonProps) {
  const [labelElement, setLabelElement] = useState<HTMLElement | null>(null);
  const [labelHidden, setLabelHidden] = useState(false);

  // The container query hides the label with display: none, which changes its
  // size to zero, so the observer runs when the label hides or shows.
  useEffect(() => {
    if (!labelElement) return;
    const observer = new ResizeObserver(() => {
      setLabelHidden(!labelElement.checkVisibility());
    });
    observer.observe(labelElement);
    return () => observer.disconnect();
  }, [labelElement]);

  return (
    // Empty content turns the tooltip off while the label shows, and the button
    // keeps focus when it turns on.
    <Tooltip content={labelHidden ? label : null}>
      {/* A hidden label doesn't name the button, so it names itself. */}
      <Button aria-label={label}>
        <ButtonSlot>
          <Icon />
        </ButtonSlot>
        <ButtonLabel ref={setLabelElement} className="@max-md:hidden">
          {label}
        </ButtonLabel>
      </Button>
    </Tooltip>
  );
}

export default function Example() {
  return (
    // Drag the corner to make the bar narrower.
    <Frame
      $layer
      $lighten
      $border
      $rounded="xl"
      $p={1}
      className="@container w-[32rem] max-w-full min-w-48 resize-x overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate ps-2 font-medium">Q3 report</h2>
        <CollapsingButton label="Share" icon={Share2Icon} />
        <CollapsingButton label="Export" icon={DownloadIcon} />
        <CollapsingButton label="Settings" icon={SettingsIcon} />
      </div>
    </Frame>
  );
}
