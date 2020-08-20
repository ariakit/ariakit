import * as React from "react";
import { Button } from "reakit/Button";
import { VisuallyHidden } from "reakit/VisuallyHidden";
import {
  Tooltip,
  TooltipReference,
  useTooltipState,
  TooltipReferenceHTMLProps,
} from "reakit/Tooltip";

type Props = TooltipReferenceHTMLProps & {
  isLocked?: boolean;
};

function LockButton({ isLocked, ...props }: Props) {
  const tooltip = useTooltipState();
  const text = `Click to ${isLocked ? "unlock" : "lock"}`;
  const icon = isLocked ? "🔒" : "🔓";
  const tip = `It's ${isLocked ? "locked" : "unlocked"}!`;
  return (
    <>
      <TooltipReference {...props} {...tooltip} as={Button}>
        <>
          <VisuallyHidden>{text}</VisuallyHidden>
          <span aria-hidden>{icon}</span>
        </>
      </TooltipReference>
      <Tooltip {...tooltip}>{tip}</Tooltip>
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
