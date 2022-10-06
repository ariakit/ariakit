import {
  Form,
  FormError,
  FormField,
  FormInput,
  FormLabel,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import { Select, SelectItem } from "./select";
import "./style.css";

export default function Example() {
  const form = useFormState({ defaultValues: { name: "", fruit: "" } });

  form.useSubmit(() => {
    alert(JSON.stringify(form.values));
  });

  return (
    <Form state={form} className="wrapper">
      <div className="field">
        <FormLabel name={form.names.name}>Name</FormLabel>
        <FormInput name={form.names.name} required placeholder="John Doe" />
        <FormError name={form.names.name} className="error" />
      </div>
      <div className="field">
        <FormLabel name={form.names.fruit}>Favorite fruit</FormLabel>
        <FormField
          as={Select}
          name={form.names.fruit}
          value={form.values.fruit}
          setValue={(value: string) => form.setValue(form.names.fruit, value)}
          touchOnBlur={false}
          onTouch={() => form.setFieldTouched(form.names.fruit, true)}
          required
        >
          <SelectItem value="">Select an item</SelectItem>
          <SelectItem value="Apple" />
          <SelectItem value="Banana" />
          <SelectItem value="Orange" />
        </FormField>
        <FormError name={form.names.fruit} className="error" />
      </div>
      <div className="buttons">
        <FormSubmit className="button">Submit</FormSubmit>
      </div>
    </Form>
  );
}
