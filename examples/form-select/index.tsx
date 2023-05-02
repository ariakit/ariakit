import * as Ariakit from "@ariakit/react";
import { Select, SelectItem } from "./select.js";
import "./style.css";

export default function Example() {
  const form = Ariakit.useFormStore({ defaultValues: { name: "", fruit: "" } });
  const fruitValue = form.useValue(form.names.fruit);

  form.useSubmit(() => {
    alert(JSON.stringify(form.getState().values));
  });

  return (
    <Ariakit.Form store={form} className="wrapper">
      <div className="field">
        <Ariakit.FormLabel name={form.names.name}>Name</Ariakit.FormLabel>
        <Ariakit.FormInput
          name={form.names.name}
          required
          placeholder="John Doe"
          className="input"
        />
        <Ariakit.FormError name={form.names.name} className="error" />
      </div>
      <div className="field">
        <Ariakit.FormLabel name={form.names.fruit}>
          Favorite fruit
        </Ariakit.FormLabel>
        <Ariakit.FormField
          as={Select}
          name={form.names.fruit}
          value={fruitValue}
          setValue={(value: string) => form.setValue(form.names.fruit, value)}
          touchOnBlur={false}
          onTouch={() => form.setFieldTouched(form.names.fruit, true)}
          required
        >
          <SelectItem value="">Select an item</SelectItem>
          <SelectItem value="Apple" />
          <SelectItem value="Banana" />
          <SelectItem value="Orange" />
        </Ariakit.FormField>
        <Ariakit.FormError name={form.names.fruit} className="error" />
      </div>
      <div className="buttons">
        <Ariakit.FormSubmit className="button">Submit</Ariakit.FormSubmit>
      </div>
    </Ariakit.Form>
  );
}
