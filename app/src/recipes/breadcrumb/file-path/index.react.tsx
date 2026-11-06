import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLabel,
  BreadcrumbLink,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";

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
            {folders.map((folder, index) => (
              <BreadcrumbLink
                key={folder}
                href={`#${folder}`}
                separator={!!index}
                $p={0.5}
              >
                <BreadcrumbLabel $truncate>{folder}</BreadcrumbLabel>
              </BreadcrumbLink>
            ))}
            <BreadcrumbCurrent separator $p={0.5}>
              {file}
            </BreadcrumbCurrent>
          </Breadcrumb>
        </TextFrame>
        <CopyButton
          value={path}
          label="Copy path"
          failedLabel="Couldn't copy the path"
          $size="sm"
          $p={1}
        />
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
