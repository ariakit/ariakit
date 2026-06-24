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
        <TagRemove value="React">Remove React filter</TagRemove>
      </p>
      <p>
        <TagRemove value="Vue" />
      </p>
      <p>
        <TagRemove
          value="Svelte"
          render={<button>Remove Svelte filter</button>}
        />
      </p>
      <p>
        <TagRemove
          value="Ember"
          render={
            <button>
              <span hidden>Remove Ember filter</span>
              <span aria-hidden>x</span>
            </button>
          }
        />
      </p>
      <p>
        <TagRemove
          value="Preact"
          render={
            <button>
              <img alt="Remove Preact filter" />
            </button>
          }
        />
      </p>
      <p>
        <span id="alpine-label">Remove Alpine filter</span>
        <TagRemove
          value="Alpine"
          render={<button aria-labelledby="alpine-label" />}
        />
      </p>
      <p>
        <span id="solid-label">Remove Solid filter</span>
        <TagRemove value="Solid" aria-labelledby="solid-label" />
      </p>
    </TagProvider>
  );
}
