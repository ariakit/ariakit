import { Tag } from "@ariakit/react-components/tag/tag";
import { TagControl } from "@ariakit/react-components/tag/tag-control";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagLabel } from "@ariakit/react-components/tag/tag-label";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { useId, useState } from "react";

interface TagFieldProps {
  label: string;
  delimiter: string;
}

function TagField({ label, delimiter }: TagFieldProps) {
  const [values, setValues] = useState<string[]>([]);
  const statusId = useId();

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagLabel>{label}</TagLabel>
      <TagControl>
        <TagList aria-describedby={statusId} style={{ display: "contents" }}>
          {values.map((value) => (
            <Tag key={value} value={value}>
              {value}
            </Tag>
          ))}
        </TagList>
        <TagInput delimiter={delimiter} aria-label={label} />
      </TagControl>
      <output id={statusId}>
        {label} values: {values.length ? values.join(", ") : "none"}
      </output>
    </TagProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <TagField label="Dot tags" delimiter="." />
      <TagField label="Plus tags" delimiter="+" />
      <TagField label="Pipe tags" delimiter="|" />
    </div>
  );
}
