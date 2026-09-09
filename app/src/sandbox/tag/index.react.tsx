import {
  OptionLabel,
  OptionSlot,
} from "@ariakit/ui/components/option.ariakit.react";
import { input } from "@ariakit/ui/styles/input";
import { option } from "@ariakit/ui/styles/option";
import { useState } from "react";
import * as Ariakit from "./ariakit-experimental.react.ts";

export default function Example() {
  const [values, setValues] = useState(["JavaScript", "React"]);
  return (
    <div className="wrapper">
      <Ariakit.TagProvider values={values} setValues={setValues}>
        <Ariakit.TagLabel>Tags</Ariakit.TagLabel>
        <Ariakit.TagControl {...input.jsx()}>
          <Ariakit.TagList style={{ display: "contents" }}>
            {values.map((value) => (
              <Ariakit.Tag
                key={value}
                value={value}
                {...option.jsx({ $lightnessOffset: true })}
              >
                <OptionLabel>{value}</OptionLabel>
                <OptionSlot>
                  <Ariakit.TagRemove />
                </OptionSlot>
              </Ariakit.Tag>
            ))}
          </Ariakit.TagList>
          <Ariakit.TagInput />
        </Ariakit.TagControl>
      </Ariakit.TagProvider>
    </div>
  );
}
