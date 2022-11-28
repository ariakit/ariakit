import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormReset,
  FormSubmit,
  useFormStore,
} from "ariakit/form/store";
import "./style.css";

export default function Example() {
  const form = useFormStore({ defaultValues: { name: "", email: "" } });

  form.useSubmit(async () => {
    alert(JSON.stringify(form.getState().values));
  });

  return (
    <Form
      store={form}
      aria-labelledby="add-new-participant"
      className="wrapper"
    >
      <h2 id="add-new-participant" className="heading">
        Add new participant
      </h2>
      <div className="field">
        <FormLabel name={form.names.name}>Name</FormLabel>
        <FormInput name={form.names.name} required placeholder="John Doe" />
        <FormError name={form.names.name} className="error" />
      </div>
      <div className="field">
        <FormLabel name={form.names.email}>Email</FormLabel>
        <FormInput
          type="email"
          name={form.names.email}
          required
          placeholder="johndoe@example.com"
        />
        <FormError name={form.names.email} className="error" />
      </div>
      <div className="buttons">
        <FormReset className="button secondary reset">Reset</FormReset>
        <FormSubmit className="button">Add</FormSubmit>
      </div>
    </Form>
  );
}
