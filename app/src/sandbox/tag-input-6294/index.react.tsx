import { Tag } from "@ariakit/react-components/tag/tag";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useState } from "react";

export default function Example() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagListLabel>Tags</TagListLabel>
      <TagList>
        {values.map((value) => (
          <Tag key={value} value={value}>
            {value}
            <TagRemove />
          </Tag>
        ))}
        <TagInput
          aria-label="New tag"
          onChange={(event) => {
            if ((event.nativeEvent as InputEvent).isComposing) {
              event.preventDefault();
            }
          }}
        />
      </TagList>
    </TagProvider>
  );
}
