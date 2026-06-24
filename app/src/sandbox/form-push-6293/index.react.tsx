import * as Ariakit from "@ariakit/react";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6293
export default function Example() {
  const form = Ariakit.useFormStore({
    defaultValues: {
      tags: ["React"],
      emails: [] as string[],
    },
  });

  const tags = Ariakit.useStoreState(form, (state) => state.values.tags);
  const emails = Ariakit.useStoreState(form, (state) => state.values.emails);
  const [focused, setFocused] = useState("none");

  const focusNewField = (name: "tags" | "emails") => {
    const length = form.getValue<string[]>(name)?.length ?? 0;
    requestAnimationFrame(() => {
      const selector = `input[name="${CSS.escape(`${name}.${length}`)}"]`;
      document.querySelector<HTMLElement>(selector)?.focus();
    });
  };

  return (
    <Ariakit.Form store={form}>
      <output>Focused field: {focused}</output>

      <fieldset>
        <legend>Tags</legend>
        {tags.map((_, index) => {
          const name = `tags.${index}`;
          return (
            <Ariakit.FormInput
              key={index}
              name={name}
              aria-label={name}
              onFocus={() => setFocused(name)}
            />
          );
        })}
        <Ariakit.FormPush
          name="tags"
          value=""
          autoFocusOnClick={false}
          onClick={() => focusNewField("tags")}
        >
          Add tag
        </Ariakit.FormPush>
      </fieldset>

      <fieldset>
        <legend>Emails</legend>
        {emails.map((_, index) => {
          const name = `emails.${index}`;
          return (
            <Ariakit.FormInput
              key={index}
              name={name}
              aria-label={name}
              onFocus={() => setFocused(name)}
            />
          );
        })}
        <Ariakit.FormPush
          name="emails"
          value=""
          autoFocusOnClick={false}
          onClick={() => focusNewField("emails")}
        >
          Add email
        </Ariakit.FormPush>
      </fieldset>
    </Ariakit.Form>
  );
}
