import "./style.css";
import {
  Form,
  FormField,
  FormInput,
  FormSelect,
  FormSubmit,
  useFormStore,
} from "./form.jsx";
import { SelectItem } from "./select.js";

export default function Example() {
  const form = useFormStore({ defaultValues: { name: "", fruit: "" } });
  const $ = form.names;

  form.useSubmit(() => {
    alert(JSON.stringify(form.getState().values));
  });

  return (
    <Form store={form}>
      <FormField name={$.name} label="Name">
        <FormInput name={$.name} required placeholder="John Doe" />
      </FormField>
      <FormField name={$.fruit} label="Favorite fruit">
        <FormSelect name={$.fruit} required>
          <SelectItem value="">Select an item</SelectItem>
          <SelectItem value="Apple" />
          <SelectItem value="Banana" />
          <SelectItem value="Orange" />
        </FormSelect>
      </FormField>
      <div className="buttons">
        <FormSubmit>Submit</FormSubmit>
      </div>
    </Form>
  );
}
