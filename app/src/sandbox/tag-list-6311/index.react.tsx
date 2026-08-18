import { Tag } from "@ariakit/react-components/tag/tag";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6311
export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <TagProvider values={values} setValues={setValues}>
      <TagListLabel>Tags</TagListLabel>
      <TagList>
        {/* Layout-neutral wrapper (e.g. rendered by a sortable/grouping
            integration): display: contents keeps the tag list layout intact,
            and tabIndex makes it match the focusable selector. Because the
            wrapper generates no box, isFocusable still rejects it — the exact
            selector/focusability mismatch that froze getClosestFocusable.
            Chrome still exposes the wrapper between the listbox and its
            options, so this markup is deliberately not a valid listbox. It
            reproduces the reported integration, not a recommended structure. */}
        <div tabIndex={-1} style={{ display: "contents" }}>
          <span>Frontend:</span>
          {values.map((value) => (
            <Tag key={value} value={value}>
              {value}
              <TagRemove />
            </Tag>
          ))}
        </div>
      </TagList>
      <TagInput aria-label="New tag" />
      <output>Tags: {values.length ? values.join(", ") : "none"}</output>
    </TagProvider>
  );
}
