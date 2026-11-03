import {
  RadioField,
  RadioGroup,
  RadioList,
} from "@ariakit/ui/components/radio.ariakit.react";

export default function Example() {
  return (
    <RadioGroup label="Sort comments by" defaultValue="newest">
      <RadioList>
        <RadioField value="newest">Newest first</RadioField>
        <RadioField value="oldest">Oldest first</RadioField>
        <RadioField value="top">Top comments</RadioField>
      </RadioList>
    </RadioGroup>
  );
}
