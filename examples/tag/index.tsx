import { useState } from "react";
import * as Ariakit from "./ariakit-experimental.ts";
import "./style.css";

export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <div className="wrapper">
      <Ariakit.TagProvider values={values} setValues={setValues}>
        <Ariakit.TagListLabel className="ak-tag-list-label">
          Tags
        </Ariakit.TagListLabel>
        <Ariakit.TagList className="ak-tag-list ak-input ak-focusable">
          {values.map((value) => (
            <Ariakit.Tag key={value} value={value} className="ak-tag">
              {value}
              <Ariakit.TagRemove className="ak-tag-remove" />
            </Ariakit.Tag>
          ))}
          <Ariakit.TagInput className="ak-tag-input" />
        </Ariakit.TagList>
      </Ariakit.TagProvider>
    </div>
  );
}
