import { Group, GroupLabel } from "@ariakit/react";
import { useState } from "react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardContent,
  CheckboxCardDescription,
  CheckboxCardGrid,
  CheckboxCardImage,
  CheckboxCardLabel,
} from "../checkbox-card.react.tsx";
import { interests as data } from "../data.ts";
import { vectors } from "../vectors.react.tsx";

const interests = {
  culture: { ...data.culture, image: vectors.culture },
  finance: { ...data.finance, image: vectors.finance },
  food: { ...data.food, image: vectors.food },
} as const;

export default function Example() {
  const [values, setValues] = useState<(keyof typeof interests)[]>([
    "culture",
    "finance",
  ]);
  return (
    <Group className="flex flex-col gap-4">
      <GroupLabel className="text-xl font-medium text-center">
        Select your interests
      </GroupLabel>
      <CheckboxCardGrid
        value={values}
        setValue={setValues}
        minItemWidth="18rem"
        className="w-110 max-w-[100cqi] gap-4 p-4"
      >
        {Object.entries(interests).map(([key, interest]) => (
          <CheckboxCard key={key} value={key} disabled={key === "finance"}>
            <CheckboxCardImage>{interest.image}</CheckboxCardImage>
            <CheckboxCardContent>
              <CheckboxCardLabel>{interest.label}</CheckboxCardLabel>
              <CheckboxCardCheck />
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
