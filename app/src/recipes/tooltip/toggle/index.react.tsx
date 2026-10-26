import {
  Button,
  ButtonGroup,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { HandIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useState } from "react";

export default function Example() {
  const [muted, setMuted] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  return (
    // A toggle button keeps its name, and aria-pressed tells its state. The
    // tooltip names the action that a click takes.
    <ButtonGroup
      aria-label="Call controls"
      $joined={false}
      $gap="sm"
      $layer
      $lighten
      $border
      $rounded="xl"
      $p={1}
    >
      <Tooltip content={muted ? "Unmute" : "Mute"}>
        <Button
          aria-label="Mute"
          aria-pressed={muted}
          onClick={() => setMuted(!muted)}
          $layer={muted ? "danger" : undefined}
        >
          <ButtonSlot>{muted ? <MicOffIcon /> : <MicIcon />}</ButtonSlot>
        </Button>
      </Tooltip>
      <Tooltip content={handRaised ? "Lower hand" : "Raise hand"}>
        <Button
          aria-label="Raise hand"
          aria-pressed={handRaised}
          onClick={() => setHandRaised(!handRaised)}
          $layer={handRaised ? "brand" : undefined}
        >
          <ButtonSlot>
            <HandIcon />
          </ButtonSlot>
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
}
