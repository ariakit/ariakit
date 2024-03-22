import "./style.css";
import { useState } from "react";
import { Tag } from "@ariakit/react-core/tag/tag";
import { TagInput } from "@ariakit/react-core/tag/tag-input";
import { TagList } from "@ariakit/react-core/tag/tag-list";
import { TagListLabel } from "@ariakit/react-core/tag/tag-list-label";
import { TagProvider } from "@ariakit/react-core/tag/tag-provider";
import { TagRemove } from "@ariakit/react-core/tag/tag-remove";

export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <div className="wrapper">
      <TagProvider values={values} setValues={setValues}>
        <TagListLabel className="tag-list-label">Tags</TagListLabel>
        <TagList className="tag-list input">
          {values.map((value) => (
            <Tag key={value} value={value} className="tag">
              {value}
              <TagRemove className="tag-remove" />
            </Tag>
          ))}
          <TagInput className="tag-input" />
        </TagList>
      </TagProvider>
    </div>
  );
}
