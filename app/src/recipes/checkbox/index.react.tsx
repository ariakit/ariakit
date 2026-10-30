import { CheckboxField } from "@ariakit/ui/components/checkbox.ariakit.react";

export default function Example() {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">Notify me about</legend>
      <CheckboxField name="notifications" value="comments" defaultChecked>
        Comments
      </CheckboxField>
      <CheckboxField name="notifications" value="mentions" defaultChecked>
        Mentions
      </CheckboxField>
      <CheckboxField name="notifications" value="digest">
        Weekly digest
      </CheckboxField>
    </fieldset>
  );
}
