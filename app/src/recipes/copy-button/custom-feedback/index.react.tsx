import { CopyButton } from "@ariakit/ui/components/copy-button.ariakit.react";

export default function Example() {
  return (
    <CopyButton
      value="ak_test_4f9a27c1"
      copiedLabel="Key copied"
      failedLabel="Couldn't copy the key"
      feedbackDuration={4000}
      $border
    >
      Copy the test key
    </CopyButton>
  );
}
