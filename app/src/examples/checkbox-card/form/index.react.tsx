import { Group, GroupLabel } from "@ariakit/react";
import { Button } from "@ariakit/ui/ariakit/button.react.tsx";
import { Input } from "@ariakit/ui/ariakit/input.react.tsx";
import { heading } from "@ariakit/ui/styles/heading.ts";
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
      className="w-120 max-w-[100cqi] flex flex-col gap-6 ak-frame ak-frame-card/8 ak-layer ak-layer-lighten-6 ak-light:ring ak-dark:ak-frame-border"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        alert(formData.getAll("interests"));
      }}
    >
      {/* The form's flex gap owns the vertical rhythm, so the heading's own
          flow margin is dropped; ! because the cv's margin would win the
          cascade over a plain override. */}
      <h2 {...heading.jsx({ $level: 2, className: "mb-0!" })}>Register</h2>
      <label className="flex flex-col gap-2">
        <div>Name</div>
        <Input placeholder="John Doe" />
      </label>
      <label className="flex flex-col gap-2">
        <div>Email</div>
        <Input type="email" placeholder="john.doe@example.com" />
      </label>
      <Group className="flex flex-col gap-4">
        <GroupLabel>Select your interests</GroupLabel>
        <CheckboxCardGrid<(keyof typeof interests)[]>
          // The cards wrap in a content-sized row like the legacy example.
          // The grid cv's own grid and gap-3 classes sort later in the
          // stylesheet, so these overrides take !.
          className="flex! flex-wrap gap-2!"
          defaultValue={["culture", "finance", "health"]}
        >
          {Object.entries(interests).map(([key, interest], index) => (
            <CheckboxCard
              key={key}
              name="interests"
              value={key}
              // Field-sized frame, like the legacy ak-frame-field/2.
              $rounded="lg"
              $p={2}
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
      <div className="ak-layer pt-6 border-t grid">
        <Button
          type="submit"
          $layer="brand"
          // Legacy plain ak-button paints no idle layer offset.
          $lightnessOffset={false}
        >
          Sign up
        </Button>
      </div>
    </form>
  );
}
