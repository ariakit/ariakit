import * as ak from "@ariakit/react";
import { useState } from "react";

// Array-field names are user-controlled (they come from `defaultValues` /
// `names`), so they can be prefixes of sibling arrays (`tags` vs `tags2`) or
// contain regex metacharacters (`c++`). FormPush/FormRemove must still match the
// exact array and focus the right field.
// See https://github.com/ariakit/ariakit/issues/6219
export default function Example() {
  const form = ak.useFormStore({
    defaultValues: {
      tags: ["React"],
      tags2: ["Solid"],
      "c++": ["11", "14"],
    },
  });

  const tags = ak.useStoreState(form, (state) => state.values.tags);
  const tags2 = ak.useStoreState(form, (state) => state.values.tags2);
  const versions = ak.useStoreState(form, (state) => state.values["c++"]);

  const [focused, setFocused] = useState("none");

  return (
    <ak.Form store={form}>
      {/* Mirrors the focused field so the wrong-focus bug is visible in the
          preview; the tests assert on the active element directly. */}
      <output>Focused field: {focused}</output>

      <fieldset>
        <legend>Tags</legend>
        {tags.map((_, index) => {
          const name = `tags.${index}`;
          return (
            <ak.FormInput
              key={index}
              name={name}
              aria-label={name}
              onFocus={() => setFocused(name)}
            />
          );
        })}
        <ak.FormPush name="tags" value="">
          Add tag
        </ak.FormPush>
      </fieldset>

      <fieldset>
        <legend>Related tags</legend>
        {tags2.map((_, index) => {
          const name = `tags2.${index}`;
          return (
            <ak.FormInput
              key={index}
              name={name}
              aria-label={name}
              onFocus={() => setFocused(name)}
            />
          );
        })}
      </fieldset>

      <fieldset>
        <legend>C++ versions</legend>
        {versions.map((version, index) => {
          if (version == null) return null;
          const name = `c++.${index}`;
          return (
            <div key={index}>
              <ak.FormInput
                name={name}
                aria-label={name}
                onFocus={() => setFocused(name)}
              />
              <ak.FormRemove name="c++" index={index}>
                Remove {name}
              </ak.FormRemove>
            </div>
          );
        })}
        <ak.FormPush name="c++" value="">
          Add version
        </ak.FormPush>
      </fieldset>
    </ak.Form>
  );
}
