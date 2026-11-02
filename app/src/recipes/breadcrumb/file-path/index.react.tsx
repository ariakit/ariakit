import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLabel,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { Check, Copy, X } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";

const folders = ["src", "components", "ui"];
const file = "breadcrumb.tsx";
const path = [...folders, file].join("/");

const source = `export function Trail({ steps }) {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      {steps.map((step) => renderStep(step))}
    </Breadcrumb>
  );
}`;

type CopyState = "idle" | "copied" | "failed";

const labels: Record<CopyState, string> = {
  idle: "Copy path",
  copied: "Copied",
  failed: "Couldn't copy the path",
};

const icons: Record<CopyState, typeof Copy> = {
  idle: Copy,
  copied: Check,
  failed: X,
};

export default function Example() {
  const [state, setState] = useState<CopyState>("idle");
  const Icon = icons[state];
  const timeoutRef = useRef(0);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setState("copied");
    } catch {
      setState("failed");
    }
    // Each copy restarts the timer, so another copy gets the full duration of
    // the feedback too.
    clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <Frame
      $darken={0.5}
      $border
      $p={2}
      $rounded="xl"
      $orientation="vertical"
      className="w-md max-w-full overflow-clip"
    >
      <Frame
        $cover
        $lighten={0.5}
        $border
        $p={1}
        className="flex items-center justify-between gap-2"
      >
        <TextFrame $p={0.5} className="min-w-0">
          <Breadcrumb aria-label="File path" $gap={0.5} className="font-mono">
            {folders.map((folder) => (
              <Fragment key={folder}>
                <BreadcrumbLink href={`#${folder}`} $p={0.5}>
                  <BreadcrumbLabel $truncate>{folder}</BreadcrumbLabel>
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </Fragment>
            ))}
            <BreadcrumbCurrent $p={0.5}>{file}</BreadcrumbCurrent>
          </Breadcrumb>
        </TextFrame>
        <Tooltip text={labels[state]}>
          <Button aria-label={labels.idle} $size="sm" $p={1} onClick={copy}>
            <ButtonSlot>
              <Icon />
            </ButtonSlot>
          </Button>
        </Tooltip>
        {/* Touch screens don't show tooltips, and screen readers don't read
            them, so the icon and a status message also report the copy. */}
        <span role="status" className="sr-only">
          {state !== "idle" && labels[state]}
        </span>
      </Frame>
      <TextFrame
        $cover
        render={<pre />}
        className="overflow-x-auto ak-ink-70 text-xs"
      >
        <code className="block">{source}</code>
      </TextFrame>
    </Frame>
  );
}
