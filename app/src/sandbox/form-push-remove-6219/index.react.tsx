import * as ak from "@ariakit/react";
import { useState } from "react";

// Workaround for https://github.com/ariakit/ariakit/issues/6219: FormPush and
// FormRemove match array fields by loose name prefix and interpolate the raw
// field name into a RegExp. Until the fix lands, avoid array names that are
// prefixes of sibling arrays and avoid regex metacharacters in field names.
// TODO: Restore the `tags2` / `c++` names once the issue above is fixed.
export default function Example() {
  const form = ak.useFormStore({
    defaultValues: {
      tags: ["React"],
      // `relatedTags` rather than `tags2` so it isn't a prefix sibling of
      // `tags`.
      relatedTags: ["Solid"],
      // `cpp` rather than `c++` so the name has no regex metacharacters.
      cpp: ["11", "14"],
    },
  });

  const tags = ak.useStoreState(form, (state) => state.values.tags);
  const relatedTags = ak.useStoreState(
    form,
    (state) => state.values.relatedTags,
  );
  const versions = ak.useStoreState(form, (state) => state.values.cpp);

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
        {relatedTags.map((_, index) => {
          const name = `relatedTags.${index}`;
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
          const name = `cpp.${index}`;
          return (
            <div key={index}>
              <ak.FormInput
                name={name}
                aria-label={name}
                onFocus={() => setFocused(name)}
              />
              <ak.FormRemove name="cpp" index={index}>
                Remove {name}
              </ak.FormRemove>
            </div>
          );
        })}
        <ak.FormPush name="cpp" value="">
          Add version
        </ak.FormPush>
      </fieldset>
    </ak.Form>
  );
}
