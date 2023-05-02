import * as React from "react";
import * as Ariakit from "@ariakit/react";
import invariant from "tiny-invariant";

type Values = { name: string };
const FormContext = React.createContext<Ariakit.FormStore<Values> | null>(null);

function Form({ children }: React.PropsWithChildren) {
  const form = Ariakit.useFormStore<Values>({
    defaultValues: { name: "" },
  });
  return (
    <FormContext.Provider value={form}>
      <Ariakit.Form store={form}>{children}</Ariakit.Form>
    </FormContext.Provider>
  );
}

function NameInput() {
  const form = React.useContext(FormContext);
  invariant(form, "NameInput should be wrapped in a Form component");
  return <Ariakit.FormInput name={form.names.name} />;
}

export default function Example() {
  return (
    <Form>
      <NameInput />
    </Form>
  );
}
