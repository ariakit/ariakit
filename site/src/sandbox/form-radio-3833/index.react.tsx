import * as ak from "@ariakit/react";

export default function Example() {
  const form = ak.useFormStore({ defaultValues: { color: "" } });

  form.useValidate(() => {
    if (!form.getValue(form.names.color)) {
      form.setError(form.names.color, "Please select a color.");
    }
  });

  form.useSubmit(async (state) => {
    alert(JSON.stringify(state.values));
  });

  return (
    <ak.Form store={form}>
      <ak.RadioProvider>
        <ak.FormRadioGroup>
          <ak.FormGroupLabel>Favorite color</ak.FormGroupLabel>
          <ak.FormError name={form.names.color} />
          <label>
            <ak.FormRadio name={form.names.color} value="red" />
            Red
          </label>
          <label>
            <ak.FormRadio name={form.names.color} value="green" />
            Green
          </label>
          <label>
            <ak.FormRadio name={form.names.color} value="blue" />
            Blue
          </label>
        </ak.FormRadioGroup>
      </ak.RadioProvider>
      <ak.FormSubmit>Submit</ak.FormSubmit>
    </ak.Form>
  );
}
