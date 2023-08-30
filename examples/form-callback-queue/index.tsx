import "./style.css";
import { useEffect, useState } from "react";
import * as Ariakit from "@ariakit/react";
import invariant from "tiny-invariant";

interface NameFieldProps extends Ariakit.FormInputProps {
  store: Ariakit.FormStore;
  label: string;
}

function RequiredField({ store, label, name, ...props }: NameFieldProps) {
  store.useValidate(() => {
    if (!store.getValue(name)) {
      store.setError(name, `${store.getError(name)} - Field 1`);
    }
  });
  store.useValidate(() => {
    if (!store.getValue(name)) {
      store.setError(name, `${store.getError(name)} - Field 2`);
    }
  });
  store.useSubmit(async () => {
    await Promise.resolve();
    store.setError(name, "Field");
  });
  return (
    <div className="field">
      <Ariakit.FormLabel name={name}>{label}</Ariakit.FormLabel>
      <Ariakit.FormInput name={name} className="input" required {...props} />
      <Ariakit.FormError name={name} className="error" />
    </div>
  );
}

interface FormProps extends Ariakit.FormProps {
  requiredNames: Array<NameFieldProps["name"]>;
}

function RequiredForm({ store, requiredNames, ...props }: FormProps) {
  invariant(store);

  store.useValidate(() => {
    requiredNames.forEach((name) => {
      if (!store.getValue(name)) {
        store.setError(name, `${store.getError(name)} - Abstract Form`);
      }
    });
  });
  store.useSubmit(() => {
    requiredNames.forEach((name) => {
      store.setError(name, `${store.getError(name)} - Abstract Form 1`);
    });
  });
  store.useSubmit(() => {
    requiredNames.forEach((name) => {
      store.setError(name, `${store.getError(name)} - Abstract Form 2`);
    });
  });
  return <Ariakit.Form store={store} {...props} />;
}

export default function Example() {
  const [showEmail, setShowEmail] = useState(false);
  const form = Ariakit.useFormStore({ defaultValues: { name: "", email: "" } });
  const requiredNames = [form.names.name, form.names.email];

  form.useValidate(() => {
    requiredNames.forEach((name) => {
      if (!form.getValue(name)) {
        form.setError(name, `${form.getError(name)} - Form`);
      }
    });
  });

  form.useSubmit(() => {
    requiredNames.forEach((name) => {
      form.setError(name, `${form.getError(name)} - Form 1`);
    });
  });

  form.useSubmit(() => {
    requiredNames.forEach((name) => {
      form.setError(name, `${form.getError(name)} - Form 2`);
    });
  });

  useEffect(() => {
    setShowEmail(true);
  }, []);

  return (
    <RequiredForm
      store={form}
      requiredNames={requiredNames}
      className="wrapper"
    >
      <RequiredField store={form} name={form.names.name} label="Name" />
      {showEmail && (
        <RequiredField store={form} name={form.names.email} label="Email" />
      )}
      <Ariakit.FormSubmit className="button">Submit</Ariakit.FormSubmit>
    </RequiredForm>
  );
}
