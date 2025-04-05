import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const form = Ariakit.useFormStore({ defaultValues: { name: "", email: "" } });

  const valid = Ariakit.useStoreState(form, (state) => {
    const pristine = Object.keys(state.touched).length === 0;
    if (pristine) return false;
    return state.valid;
  });

  return (
    <Ariakit.Form
      store={form}
      aria-labelledby="add-new-participant"
      className="wrapper"
    >
      <h2 id="add-new-participant" className="heading">
        Add new participant
      </h2>
      <div className="field">
        <Ariakit.FormLabel name={form.names.name}>Name</Ariakit.FormLabel>
        <Ariakit.FormInput
          name={form.names.name}
          placeholder="John Doe"
          className="input"
          required
        />
        <Ariakit.FormError name={form.names.name} className="error" />
      </div>
      <div className="field">
        <Ariakit.FormLabel name={form.names.email}>Email</Ariakit.FormLabel>
        <Ariakit.FormInput
          type="text"
          name={form.names.email}
          placeholder="johndoe@example.com"
          className="input"
          required
        />
        <Ariakit.FormError name={form.names.email} className="error" />
      </div>
      <div className="buttons">
        <Ariakit.FormReset className="button secondary reset">
          Reset
        </Ariakit.FormReset>
        <Ariakit.FormSubmit className="button" disabled={!valid}>
          Add
        </Ariakit.FormSubmit>
      </div>
    </Ariakit.Form>
  );
}
