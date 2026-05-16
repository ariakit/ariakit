import { Group, GroupLabel } from "@ariakit/react";
import { useState } from "react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardGrid,
  CheckboxCardLabel,
} from "../checkbox-card.react.tsx";
import { interests as data } from "../data.ts";

const interests = {
  culture: data.culture,
  finance: data.finance,
  food: data.food,
  health: data.health,
  history: data.history,
  productivity: data.productivity,
} as const;

export default function Example() {
  const [values, setValues] = useState<(keyof typeof interests)[]>(["finance"]);
  return (
    <Group className="flex flex-col gap-4">
      <GroupLabel className="text-xl font-medium text-center">
        Select your interests
      </GroupLabel>
      <CheckboxCardGrid
        value={values}
        setValue={setValues}
        className="w-150 max-w-[100cqi] gap-4 p-4"
      >
        {Object.entries(interests).map(([key, interest]) => (
          <CheckboxCard key={key} value={key} disabled={key === "culture"}>
            <CheckboxCardLabel>{interest.label}</CheckboxCardLabel>
            <CheckboxCardCheck />
          </CheckboxCard>
        ))}
      </CheckboxCardGrid>
    </Group>
  );
}
