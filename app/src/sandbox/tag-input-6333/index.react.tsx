import { Tag } from "@ariakit/react-components/tag/tag";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { useId, useState } from "react";

interface TagFieldProps {
  label: string;
  delimiter: string | RegExp;
}

function TagField({ label, delimiter }: TagFieldProps) {
  const [values, setValues] = useState<string[]>([]);
  const statusId = useId();

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagListLabel>{label}</TagListLabel>
      <TagList aria-describedby={statusId}>
        {values.map((value) => (
          <Tag key={value} value={value}>
            {value}
          </Tag>
        ))}
        <TagInput delimiter={delimiter} aria-label={label} />
      </TagList>
      <output id={statusId}>
        {label} values: {values.length ? values.join(", ") : "none"}
      </output>
    </TagProvider>
  );
}

export default function Example() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 16 }}>
      <TagField label="Dot tags" delimiter={/\./} />
      <TagField label="Plus tags" delimiter={/[+]/} />
    </div>
  );
}
