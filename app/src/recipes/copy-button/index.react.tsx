import { Code } from "@ariakit/ui/components/code.ariakit.react";
import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";

const INVITE_CODE = "7F3K-2PLQ";

export default function Example() {
  return (
    <div className="flex items-center gap-2">
      <Code>{INVITE_CODE}</Code>
      <CopyButton value={INVITE_CODE} label="Copy invite code" $size="sm" />
    </div>
  );
}
