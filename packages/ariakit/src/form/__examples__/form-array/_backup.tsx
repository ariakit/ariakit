import {
  Form,
  FormError,
  FormInput,
  FormLabel,
  FormPush,
  FormRemove,
  FormSubmit,
  useFormState,
} from "ariakit/form";
import "./style.css";

export default function Example() {
  const form = useFormState({ defaultValues: { guests: [""] } });
  const { names, values } = form;

  form.useSubmit(() => {
    alert(JSON.stringify(values, null, 2));
  });

  return (
    <Form state={form} className="form">
      {values.guests.map(
        (guest, i) =>
          guest !== null && (
            <div className="field" key={i}>
              <div className="field-header">
                <FormLabel name={names.guests[i]!}>Email address</FormLabel>
                <FormRemove name={names.guests} index={i}>
                  Remove
                </FormRemove>
              </div>
              <FormInput name={names.guests[i]!} type="email" />
              <FormError name={names.guests[i]!} className="error" />
            </div>
          )
      )}
      <FormPush name={names.guests} value="" className="add-new">
        Add new guest
      </FormPush>
      <FormSubmit className="button">Submit</FormSubmit>
    </Form>
  );
}
