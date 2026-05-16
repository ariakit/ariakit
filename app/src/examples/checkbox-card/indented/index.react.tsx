import { Group, GroupLabel } from "@ariakit/react";
import { useState } from "react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "../checkbox-card.react.tsx";
import { interests as data } from "../data.ts";

const interests = {
  technology: data.technology,
  culture: data.culture,
  health: data.health,
  finance: data.finance,
} as const;

export default function Example() {
  const [values, setValues] = useState<(keyof typeof interests)[]>([
    "technology",
    "culture",
  ]);
  return (
    <Group className="flex flex-col gap-4">
      <GroupLabel className="text-xl font-medium text-center">
        Select your interests
      </GroupLabel>
      <CheckboxCardGrid
        value={values}
        setValue={setValues}
        minItemWidth="17rem"
        className="w-180 max-w-[100cqi] gap-6 p-6"
      >
        {Object.entries(interests).map(([key, interest]) => (
          <CheckboxCard key={key} value={key} disabled={key === "technology"}>
            <CheckboxCardCheck />
            <CheckboxCardContent>
              <CheckboxCardLabel>{interest.label}</CheckboxCardLabel>
              <CheckboxCardDescription>
                {interest.description}
              </CheckboxCardDescription>
            </CheckboxCardContent>
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
    </Group>
  );
}
