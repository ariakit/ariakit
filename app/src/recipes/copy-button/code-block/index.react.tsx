import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";

const source = `pnpm add @ariakit/react
pnpm dev`;

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
        <TextFrame $p={0.5} className="font-mono text-xs">
          Terminal
        </TextFrame>
        <CopyButton
          value={source}
          label="Copy commands"
          tooltip={{ placement: "left" }}
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
