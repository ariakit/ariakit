import { useId } from "react";
import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const id = useId();
  const form = Ariakit.useFormStore({ defaultValues: { color: "" } });

  form.useValidate(() => {
    if (!form.getValue(form.names.color)) {
      form.setError(form.names.color, "Please select a color.");
    }
  });

  form.useSubmit(async (state) => {
    alert(JSON.stringify(state.values));
  });

  return (
    <Ariakit.Form store={form} aria-labelledby={id} className="wrapper">
      <h2 id={id} className="heading">
        Preferences
      </h2>
      <Ariakit.FormRadioGroup className="radio-group">
        <Ariakit.FormGroupLabel className="radio-group-label">
          Favorite color
        </Ariakit.FormGroupLabel>
        <Ariakit.FormError name={form.names.color} className="error" />
        <label className="radio-label">
          <Ariakit.FormRadio name={form.names.color} value="red" />
          Red
        </label>
        <label className="radio-label">
          <Ariakit.FormRadio name={form.names.color} value="green" />
          Green
        </label>
        <label className="radio-label">
          <Ariakit.FormRadio name={form.names.color} value="blue" />
          Blue
        </label>
      </Ariakit.FormRadioGroup>
      <Ariakit.FormSubmit className="button">Submit</Ariakit.FormSubmit>
    </Ariakit.Form>
  );
}
