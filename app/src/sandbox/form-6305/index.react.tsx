import * as ak from "@ariakit/react";
import { useEffect, useRef, useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6305
export default function Example() {
  const form = ak.useFormStore({
    defaultValues: { company: "", email: "" },
  });
  const formRef = useRef<HTMLFormElement>(null);
  const submitFailed = ak.useStoreState(form, "submitFailed");
  const [showCompany, setShowCompany] = useState(false);

  // TODO: Remove when https://github.com/ariakit/ariakit/issues/6305 is fixed.
  useEffect(() => {
    if (!submitFailed) return;
    const field = formRef.current?.querySelector<HTMLElement>(
      "[aria-invalid='true']",
    );
    if (!field) return;
    field.focus();
    if (field instanceof HTMLInputElement) {
      field.select();
    } else if (field instanceof HTMLTextAreaElement) {
      field.select();
    }
  }, [submitFailed]);

  return (
    <ak.Form ref={formRef} store={form} autoFocusOnSubmit={false}>
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
