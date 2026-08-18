import { useState } from "react";
import * as Ariakit from "./ariakit-experimental.react.ts";

export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <div className="wrapper">
      <Ariakit.TagProvider values={values} setValues={setValues}>
        <Ariakit.TagListLabel className="ak-tag-list-label">
          Tags
        </Ariakit.TagListLabel>
        <div className="ak-tag-list ak-input ak-focusable">
          <Ariakit.TagList style={{ display: "contents" }}>
            {values.map((value) => (
              <Ariakit.Tag key={value} value={value} className="ak-tag">
                {value}
                <Ariakit.TagRemove className="ak-tag-remove" />
              </Ariakit.Tag>
            ))}
          </Ariakit.TagList>
          <Ariakit.TagInput className="ak-tag-input" />
        </div>
      </Ariakit.TagProvider>
    </div>
  );
}
