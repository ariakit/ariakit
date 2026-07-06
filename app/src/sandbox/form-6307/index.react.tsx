import * as ak from "@ariakit/react";
import { useState } from "react";

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

  // The email is required. Validation runs through the standard
  // `useFormValidate` API so the invalid state is deterministic across
  // environments. `validate()` resets the errors before running this callback,
  // so it only needs to set the current violation.
  ak.useFormValidate(form, () => {
    if (!form.getValue(form.names.email)) {
      form.setError(form.names.email, "Email is required");
    }
  });

  // Surface the number of successful submissions so the success is observable in
  // the preview (and so tests can wait for the submit to fully settle).
  const successCount = ak.useStoreState(form, "submitSucceed");

  const [showNickname, setShowNickname] = useState(false);

  return (
    <ak.Form store={form} resetOnSubmit={false}>
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
