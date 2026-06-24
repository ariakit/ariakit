import * as ak from "@ariakit/react";
import { useState } from "react";
import type { FormEvent } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6307
//
// With `resetOnSubmit={false}`, a *successful* submit used to leave the form's
// internal auto-focus flag armed. A later change to the form items — such as
// mounting the optional nickname field — would then yank focus into the first
// invalid field, even though no submission happened. The "Add nickname" button
// should keep focus after being activated.
export default function Example() {
  const form = ak.useFormStore({
    defaultValues: { email: "", nickname: "" },
  });

  // The email is required. Validation runs through the standard `useValidate`
  // API so the invalid state is deterministic across environments. `validate()`
  // resets the errors before running this callback, so it only needs to set the
  // current violation.
  form.useValidate(() => {
    if (!form.getValue(form.names.email)) {
      form.setError(form.names.email, "Email is required");
    }
  });

  // Surface the number of successful submissions so the success is observable in
  // the preview (and so tests can wait for the submit to fully settle).
  const successCount = ak.useStoreState(form, "submitSucceed");

  const [showNickname, setShowNickname] = useState(false);

  // TODO(https://github.com/ariakit/ariakit/issues/6307): Workaround. Opt out of
  // the built-in `autoFocusOnSubmit` and focus the first invalid field from
  // `onSubmit`, tied to the actual submission outcome, so a later items change
  // can't steal focus. Remove once the library fix is released.
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void form.submit().then((submitted) => {
      if (submitted) return;
      const { items } = form.getState();
      const field = items.find(
        (item) =>
          item.type === "field" &&
          item.element?.getAttribute("aria-invalid") === "true",
      );
      const element = field?.element;
      if (!element) return;
      element.focus();
      if (element instanceof HTMLInputElement) {
        element.select();
      }
    });
  };

  return (
    <ak.Form
      store={form}
      resetOnSubmit={false}
      autoFocusOnSubmit={false}
      onSubmit={onSubmit}
    >
      <output>Successful submissions: {successCount}</output>

      <div>
        <ak.FormLabel name={form.names.email}>Email</ak.FormLabel>
        <ak.FormInput name={form.names.email} />
        <ak.FormError name={form.names.email} />
      </div>

      {showNickname && (
        <div>
          <ak.FormLabel name={form.names.nickname}>Nickname</ak.FormLabel>
          <ak.FormInput name={form.names.nickname} />
        </div>
      )}

      <button type="button" onClick={() => setShowNickname(true)}>
        Add nickname
      </button>

      <ak.FormSubmit>Save</ak.FormSubmit>
    </ak.Form>
  );
}
