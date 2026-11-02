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
import { Check, Copy } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

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

export default function Example() {
  const [copied, setCopied] = useState(false);

  // The button goes back to its action, so another copy gives feedback too.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

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
        <Tooltip text={copied ? "Copied" : "Copy path"}>
          <Button
            aria-label={copied ? "Copied" : "Copy path"}
            $size="sm"
            $p={1}
            onClick={async () => {
              await navigator.clipboard.writeText(path);
              setCopied(true);
            }}
          >
            <ButtonSlot>{copied ? <Check /> : <Copy />}</ButtonSlot>
          </Button>
        </Tooltip>
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
