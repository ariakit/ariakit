import { Tag } from "@ariakit/react-components/tag/tag";
import { TagControl } from "@ariakit/react-components/tag/tag-control";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagLabel } from "@ariakit/react-components/tag/tag-label";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6330
export default function Example() {
  const [values, setValues] = useState(["React", "Vue"]);

  return (
    <TagProvider values={values} setValues={setValues}>
      <TagLabel>Active filters</TagLabel>
      <TagControl>
        <TagList style={{ display: "contents" }}>
          {values.map((value) => (
            <Tag key={value} value={value}>
              {value}
              <TagRemove />
            </Tag>
          ))}
        </TagList>
        <TagInput aria-label="Add filter" />
      </TagControl>
      <p>
        <TagRemove value="React">Remove React filter</TagRemove>
      </p>
      <p>
        <TagRemove value="Vue" aria-label="Remove Vue filter">
          <span aria-hidden>x</span>
        </TagRemove>
      </p>
      <p>
        <TagRemove value="Angular" aria-label="Remove Angular filter" />
      </p>
      <p>
        <TagRemove
          value="Svelte"
          render={<button>Remove Svelte filter</button>}
        />
      </p>
      <p>
        <span id="solid-label">Remove Solid filter</span>
        <TagRemove value="Solid" aria-labelledby="solid-label">
          <span aria-hidden>x</span>
        </TagRemove>
      </p>
    </TagProvider>
  );
}
