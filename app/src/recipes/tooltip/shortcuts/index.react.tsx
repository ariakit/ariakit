import * as ak from "@ariakit/react";
import {
  Button,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import {
  Tooltip,
  TooltipSlot,
} from "@ariakit/ui/components/tooltip.ariakit.react";
import type { LucideIcon } from "lucide-react";
import { BoldIcon, CodeIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import { useApplePlatform } from "./platform.react.ts";

interface Tool {
  label: string;
  key: string;
  icon: LucideIcon;
}

const tools: Tool[] = [
  { label: "Bold", key: "B", icon: BoldIcon },
  { label: "Italic", key: "I", icon: ItalicIcon },
  { label: "Underline", key: "U", icon: UnderlineIcon },
  { label: "Code", key: "E", icon: CodeIcon },
];

export default function Example() {
  const apple = useApplePlatform();
  return (
    <ak.Toolbar
      aria-label="Text formatting"
      render={<ButtonGroup $layer $lighten $border $rounded="xl" $p={1} />}
    >
      {tools.map((tool) => (
        <Tooltip
          key={tool.key}
          content={
            <>
              {tool.label}
              <TooltipSlot $kind="text">
                <Kbd>
                  {apple ? "⌘" : "Ctrl+"}
                  {tool.key}
                </Kbd>
              </TooltipSlot>
            </>
          }
        >
          {/* The editor of an app handles the shortcuts, and
              aria-keyshortcuts announces them to screen readers. */}
          <ak.ToolbarItem
            render={
              <Button
                aria-label={tool.label}
                aria-keyshortcuts={`${apple ? "Meta" : "Control"}+${tool.key}`}
              />
            }
          >
            <ButtonSlot>
              <tool.icon />
            </ButtonSlot>
          </ak.ToolbarItem>
        </Tooltip>
      ))}
    </ak.Toolbar>
  );
}
