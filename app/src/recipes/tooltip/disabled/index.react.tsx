import { Button } from "@ariakit/ui/components/button.ariakit.react";
import {
  Input,
  InputDescription,
  InputField,
  InputLabel,
} from "@ariakit/ui/components/input.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useId, useState } from "react";

export default function Example() {
  const id = useId();
  const reasonId = `${id}-reason`;
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState("");
  const reason = title.trim() ? null : "Add a title to publish.";
  return (
    <form
      className="grid w-[24rem] max-w-full gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (reason) return;
        setPublished(title.trim());
      }}
    >
      <InputField>
        <InputLabel htmlFor={id}>Title</InputLabel>
        <Input
          id={id}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {/* Touch screens don't show tooltips, so the reason also shows here.
            It keeps its line without a reason, so the form doesn't move when
            the reason goes. */}
        <InputDescription id={reasonId} className="min-h-lh">
          {reason}
        </InputDescription>
      </InputField>
      <div className="flex items-center justify-between gap-4">
        <p role="status" className="ak-ink-70 text-sm">
          {published && `Published “${published}”.`}
        </p>
        {/* The disabled button keeps focus, so keyboard users get the tooltip
            too. Screen readers read the reason as its description. */}
        <Tooltip content={reason}>
          <Button
            type="submit"
            $layer="brand"
            disabled={!!reason}
            accessibleWhenDisabled
            aria-describedby={reason ? reasonId : undefined}
          >
            Publish
          </Button>
        </Tooltip>
      </div>
    </form>
  );
}
