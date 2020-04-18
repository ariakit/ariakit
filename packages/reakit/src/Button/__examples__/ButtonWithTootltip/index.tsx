import * as React from "react";
import { Button } from "reakit/Button";
import { Tooltip, TooltipReference, useTooltipState } from "reakit/Tooltip";
import { VisuallyHidden } from "reakit/VisuallyHidden";

type Props = {
  isLocked: boolean;
  onClick: () => void;
};

function LockButton({ isLocked, ...rest }: Props) {
  const tooltip = useTooltipState();
  return (
    <>
      <TooltipReference {...rest} {...tooltip} as={Button}>
        {isLocked ? (
          <>
            <VisuallyHidden>Click to unlock</VisuallyHidden>{" "}
            <span aria-hidden>🔒</span>
          </>
        ) : (
          <>
            <VisuallyHidden>Click to lock</VisuallyHidden>{" "}
            <span aria-hidden>🔓</span>
          </>
        )}
      </TooltipReference>
      <Tooltip {...tooltip}>{`It's ${
        isLocked ? "locked" : "unlocked"
      }!`}</Tooltip>
    </>
  );
}

export default function ButtonWithTooltip() {
  const [isLocked, setLock] = React.useState(false);
  return (
    <LockButton
      isLocked={isLocked}
      onClick={() => setLock((prevState) => !prevState)}
    />
  );
}
