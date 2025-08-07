import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardLabel,
} from "./checkbox-card.react.tsx";

export default function Example() {
  return (
    <CheckboxCard defaultChecked>
      <CheckboxCardLabel>Technology</CheckboxCardLabel>
      <CheckboxCardCheck />
    </CheckboxCard>
  );
}
