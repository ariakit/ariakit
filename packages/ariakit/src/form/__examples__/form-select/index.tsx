import { useEffect } from "react";
import {
  Form,
  FormError,
  FormField,
  FormLabel,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import { Select, SelectItem } from "./select";
import "./style.css";

export default function Example() {
  const form = useFormState({
    defaultValues: { fruit: "" },
    defaultTouched: { fruit: true },
  });

  form.useSubmit(() => {
    alert(JSON.stringify(form.values));
  });

  useEffect(() => {
    form.validate();
  }, [form.validate]);

  return (
    <Form state={form} className="form">
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
      <FormSubmit className="button">Submit</FormSubmit>
    </Form>
  );
}
