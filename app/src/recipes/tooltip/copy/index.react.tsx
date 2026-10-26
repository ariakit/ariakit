import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputGroup,
  InputLabel,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

const INVITE_LINK = "https://ariakit.com/invite/7f3k2";

// The feedback stays for 2 seconds, then the button offers to copy again.
const FEEDBACK_DURATION = 2000;

type CopyState = "idle" | "copied" | "failed";

const messages: Record<CopyState, string> = {
  idle: "",
  copied: "Link copied to the clipboard.",
  failed: "Couldn't copy the link. Select it and copy it instead.",
};

export default function Example() {
  const id = useId();
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(() => setState("idle"), FEEDBACK_DURATION);
    return () => clearTimeout(timeout);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <InputField className="w-[24rem] max-w-full">
      <InputLabel htmlFor={id}>Invite link</InputLabel>
      <InputGroup>
        <Input id={id} readOnly value={INVITE_LINK} />
        <InputSlot $size="2xl">
          {/* The tooltip stays open after the click and confirms the copy. */}
          <Tooltip content={state === "copied" ? "Copied" : "Copy link"}>
            <Button aria-label="Copy link" $size="sm" onClick={copy}>
              <ButtonSlot>
                {state === "copied" ? <CheckIcon /> : <CopyIcon />}
              </ButtonSlot>
            </Button>
          </Tooltip>
        </InputSlot>
      </InputGroup>
      {/* Touch screens don't show tooltips, and screen readers don't read
          them, so a status message also reports the copy. It keeps its line
          while empty, so the field doesn't move when the message shows. */}
      <InputDescription role="status" className="min-h-lh">
        {messages[state]}
      </InputDescription>
    </InputField>
  );
}
