import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormReset,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import "./style.css";

export default function Example() {
  const form = useFormState({ defaultValues: { name: "" } });

  form.useSubmit(() => {
    alert(JSON.stringify(form.values));
  });

  return (
    <div className="wrapper">
      <Form state={form} className="form">
        <div className="field">
          <FormLabel name={form.names.name}>Name</FormLabel>
          <FormInput name={form.names.name} required placeholder="John Doe" />
          <FormError name={form.names.name} className="error" />
        </div>
        <FormSubmit className="button">Submit</FormSubmit>
        <FormReset className="button secondary">Reset</FormReset>
      </Form>
    </div>
  );
}
