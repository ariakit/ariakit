import { useState } from "react";
import * as Ariakit from "./ariakit-experimental.ts";
import "./style.css";

export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <div className="wrapper">
      <Ariakit.TagProvider values={values} setValues={setValues}>
        <Ariakit.TagListLabel className="tag-list-label">
          Tags
        </Ariakit.TagListLabel>
        <Ariakit.TagList className="tag-list input focusable">
          {values.map((value) => (
            <Ariakit.Tag key={value} value={value} className="tag">
              {value}
              <Ariakit.TagRemove className="tag-remove" />
            </Ariakit.Tag>
          ))}
          <Ariakit.TagInput className="tag-input" />
        </Ariakit.TagList>
      </Ariakit.TagProvider>
    </div>
  );
}
