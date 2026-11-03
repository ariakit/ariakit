import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";

const LINK = "https://ariakit.com/invite/7f3k2";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <CopyButton value={LINK}>Copy link</CopyButton>
      <CopyButton value={LINK} $border>
        Copy URL
      </CopyButton>
      <CopyButton value={LINK} $kind="bevel">
        Copy address
      </CopyButton>
      <CopyButton value={LINK} $kind="bevel" $layer="brand">
        Share invite
      </CopyButton>
    </div>
  );
}
