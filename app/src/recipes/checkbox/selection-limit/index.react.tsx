import * as ak from "@ariakit/react";
import {
  CheckboxCard,
  CheckboxCardCheck,
  CheckboxCardGrid,
  CheckboxCardLabel,
  CheckboxCardSlot,
} from "@ariakit/ui/components/checkbox.ariakit.react";
import {
  Code,
  Handshake,
  LifeBuoy,
  Megaphone,
  Package,
  Palette,
} from "lucide-react";
import { useId, useState } from "react";

const topics = [
  { value: "design", label: "Design", icon: Palette },
  { value: "engineering", label: "Engineering", icon: Code },
  { value: "marketing", label: "Marketing", icon: Megaphone },
  { value: "product", label: "Product", icon: Package },
  { value: "sales", label: "Sales", icon: Handshake },
  { value: "support", label: "Support", icon: LifeBuoy },
];

const maxTopics = 3;

export default function Example() {
  const labelId = useId();
  const [selected, setSelected] = useState(["design", "engineering"]);
  const full = selected.length >= maxTopics;
  return (
    // The width fits three columns of cards wide enough for the longest topic,
    // so its check stays on the same line.
    <div className="grid w-[38rem] max-w-full gap-2">
      <span id={labelId} className="text-sm font-medium">
        Pick up to {maxTopics} topics
      </span>
      <ak.CheckboxProvider value={selected} setValue={setSelected}>
        <CheckboxCardGrid aria-labelledby={labelId} $minItemSize="11rem">
          {topics.map((topic) => (
            <CheckboxCard
              key={topic.value}
              name="topics"
              value={topic.value}
              // At the limit, the topics that are not picked are disabled. The
              // status below tells why.
              disabled={full && !selected.includes(topic.value)}
            >
              <CheckboxCardSlot>
                <topic.icon />
              </CheckboxCardSlot>
              <CheckboxCardLabel>{topic.label}</CheckboxCardLabel>
              <CheckboxCardCheck />
            </CheckboxCard>
          ))}
        </CheckboxCardGrid>
      </ak.CheckboxProvider>
      <p role="status" className="ak-ink-70 text-sm">
        {selected.length} of {maxTopics} picked.
        {full && " Clear a topic to pick another."}
      </p>
    </div>
  );
}
