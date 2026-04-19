import { Group, GroupLabel } from "@ariakit/react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "../checkbox-card.react.tsx";
import { interests } from "../data.ts";

export default function Example() {
  return (
    <form
      className="w-120 max-w-[100cqi] flex flex-col gap-6 ak-frame-card/8 ak-layer ak-light:ring ak-dark:ak-frame-border"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        alert(formData.getAll("interests"));
      }}
    >
      <h2 className="ak-heading-2">Register</h2>
      <label className="flex flex-col gap-2">
        <div>Name</div>
        <input type="text" className="ak-input" placeholder="John Doe" />
      </label>
      <label className="flex flex-col gap-2">
        <div>Email</div>
        <input
          type="email"
          className="ak-input"
          placeholder="john.doe@example.com"
        />
      </label>
      <Group className="flex flex-col gap-4">
        <GroupLabel>Select your interests</GroupLabel>
        <CheckboxCardGrid<(keyof typeof interests)[]>
          className="flex flex-wrap gap-2"
          defaultValue={["culture", "finance", "health"]}
        >
          {Object.entries(interests).map(([key, interest], index) => (
            <CheckboxCard
              key={key}
              name="interests"
              value={key}
              className="ak-frame-field/2"
              disabled={index === 0}
            >
              <CheckboxCardCheck />
              <CheckboxCardLabel className="text-center">
                {interest.label}
              </CheckboxCardLabel>
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </Group>
      <div className="ak-layer-current pt-6 border-t grid">
        <button type="submit" className="ak-button ak-layer-primary">
          Sign up
        </button>
      </div>
    </form>
  );
}
