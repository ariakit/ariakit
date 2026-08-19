import { Tag } from "@ariakit/react-components/tag/tag";
import { TagControl } from "@ariakit/react-components/tag/tag-control";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagLabel } from "@ariakit/react-components/tag/tag-label";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useState } from "react";

export default function Example() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagLabel>Tags</TagLabel>
      <TagControl>
        <TagList>
          {values.map((value) => (
            <Tag key={value} value={value}>
              {value}
              <TagRemove />
            </Tag>
          ))}
        </TagList>
        <TagInput aria-label="New tag" />
      </TagControl>
    </TagProvider>
  );
}
