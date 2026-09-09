import {
  Control,
  ControlContent,
  ControlDescription,
  ControlLabel,
  ControlSlot,
} from "@ariakit/ui/components/control.ariakit.react.tsx";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react.tsx";
import { Input } from "@ariakit/ui/components/input.ariakit.react.tsx";
import { Text } from "@ariakit/ui/components/text.ariakit.react.tsx";

export default function Thumbnail() {
  return (
    <div className="flex flex-col gap-2 items-center" aria-hidden>
      <Input focusable={false} render={<div />} className="w-64 mt-4">
        e.g., John Doe
      </Input>
      <Frame
        $rounded="xl"
        $p={1}
        $lighten
        $border
        className="w-66 max-w-full shadow-xl"
      >
        <Text render={<div />} className="p-2 text-sm font-medium ak-ink-60">
          Members
        </Text>
        <Control $layer $lightnessOffset={true} className="justify-start">
          <ControlSlot $kind="avatar" $layer="brand" $contrast />
          <ControlContent>
            <ControlLabel>John Smith</ControlLabel>
            <ControlDescription>john@example.com</ControlDescription>
          </ControlContent>
        </Control>
        <Control className="justify-start">
          <ControlSlot $kind="avatar" />
          <ControlContent>
            <ControlLabel>Emma Johnson</ControlLabel>
            <ControlDescription>emma@example.com</ControlDescription>
          </ControlContent>
        </Control>
        <Text render={<div />} className="p-2 text-sm font-medium ak-ink-60">
          Files
        </Text>
        <Control className="justify-start">
          <ControlSlot $kind="avatar" />
          <ControlContent>
            <ControlLabel>annual_report.pdf</ControlLabel>
            <ControlDescription>Documents</ControlDescription>
          </ControlContent>
        </Control>
      </Frame>
    </div>
  );
}
