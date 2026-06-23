import { Tag } from "@ariakit/react-components/tag/tag";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
export default function Example() {
  const [values, setValues] = useState(["React", "Vue"]);

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagListLabel>Active filters</TagListLabel>
      <TagList>
        {values.map((value) => (
          <Tag key={value} value={value}>
            {value}
            <TagRemove />
          </Tag>
        ))}
        <TagInput aria-label="Add filter" />
      </TagList>
      <p>
        <TagRemove value="React" aria-hidden={false}>
          Remove React filter
        </TagRemove>
      </p>
      <p>
        <TagRemove value="Vue" aria-hidden={false} aria-label="Remove Vue" />
      </p>
    </TagProvider>
  );
}
