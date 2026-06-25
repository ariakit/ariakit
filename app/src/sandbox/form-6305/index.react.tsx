import * as ak from "@ariakit/react";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6305
export default function Example() {
  const form = ak.useFormStore({
    defaultValues: { company: "", email: "" },
  });
  const [showCompany, setShowCompany] = useState(false);

  return (
    <ak.Form store={form}>
      {showCompany && (
        <div>
          <ak.FormLabel name={form.names.company}>Company</ak.FormLabel>
          <ak.FormInput name={form.names.company} required />
          <ak.FormError name={form.names.company} />
        </div>
      )}

      <div>
        <ak.FormLabel name={form.names.email}>Email</ak.FormLabel>
        <ak.FormInput name={form.names.email} required />
        <ak.FormError name={form.names.email} />
      </div>

      {!showCompany && (
        <button type="button" onClick={() => setShowCompany(true)}>
          Add company details
        </button>
      )}

      <ak.FormSubmit>Sign up</ak.FormSubmit>
    </ak.Form>
  );
}
