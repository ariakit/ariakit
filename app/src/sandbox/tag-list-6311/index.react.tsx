import { Tag } from "@ariakit/react-components/tag/tag";
import { TagInput } from "@ariakit/react-components/tag/tag-input";
import { TagList } from "@ariakit/react-components/tag/tag-list";
import { TagListLabel } from "@ariakit/react-components/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-components/tag/tag-provider";
import { TagRemove } from "@ariakit/react-components/tag/tag-remove";
import { useRef, useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6311
export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <TagProvider values={values} setValues={setValues}>
      <TagListLabel>Tags</TagListLabel>
      <TagList
        // TODO: Remove this workaround once the fix for
        // https://github.com/ariakit/ariakit/issues/6311 is released.
        onMouseDown={(event) => {
          const target = event.target as HTMLElement;
          // Let the built-in handler run when the click lands on a tag or the
          // input, where getClosestFocusable terminates immediately. Tags use
          // role="option" (or role="listitem" on touch devices).
          if (target.closest("[role='option'], [role='listitem'], input")) {
            return;
          }
          // Otherwise skip the built-in handler (which would hang walking past
          // the display: contents wrapper) and replicate its outcome: focus
          // the input. preventDefault keeps the mousedown from blurring it.
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {/* Layout-neutral wrapper (e.g. rendered by a sortable/grouping
            integration): display: contents keeps the tag list layout intact,
            and tabIndex makes it match the focusable selector. Because the
            wrapper generates no box, isFocusable still rejects it — the exact
            selector/focusability mismatch that froze getClosestFocusable. */}
        <div tabIndex={-1} style={{ display: "contents" }}>
          <span>Frontend:</span>
          {values.map((value) => (
            <Tag key={value} value={value}>
              {value}
              <TagRemove />
            </Tag>
          ))}
        </div>
        <TagInput ref={inputRef} aria-label="New tag" />
      </TagList>
      <output>Tags: {values.length ? values.join(", ") : "none"}</output>
    </TagProvider>
  );
}
