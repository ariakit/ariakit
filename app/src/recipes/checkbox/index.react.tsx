import {
  CheckboxField,
  CheckboxGroup,
  CheckboxList,
} from "@ariakit/ui/components/checkbox.ariakit.react";

export default function Example() {
  return (
    <CheckboxGroup label="Notify me about">
      <CheckboxList>
        <CheckboxField name="notifications" value="comments" defaultChecked>
          Comments
        </CheckboxField>
        <CheckboxField name="notifications" value="mentions" defaultChecked>
          Mentions
        </CheckboxField>
        <CheckboxField name="notifications" value="digest">
          Weekly digest
        </CheckboxField>
      </CheckboxList>
    </CheckboxGroup>
  );
}
