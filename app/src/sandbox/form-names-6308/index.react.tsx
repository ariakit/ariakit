import * as ak from "@ariakit/react";
import { Component, useState } from "react";
import type { ReactNode } from "react";

// Regression fixture for https://github.com/ariakit/ariakit/issues/6308.
// React and Object.prototype.toString probe absent symbol keys; the names
// proxy must return undefined instead of coercing a Symbol to a string.
class NameBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <span role="alert">Render error: {this.state.error.message}</span>;
    }
    return this.props.children;
  }
}

export default function Example() {
  const form = ak.useFormStore({ defaultValues: { email: "" } });
  const [fieldNameVisible, setFieldNameVisible] = useState(false);
  const [objectTag, setObjectTag] = useState<string>();

  // Rendering a raw name as a React child is intentionally invalid here:
  // `form.names.email` is typed as a string-like object, not a string, so
  // TypeScript already flags it — the documented cue to coerce with
  // `${form.names.email}`. Leaving it un-coerced exercises react-dom's
  // `Symbol.iterator` probe on the names proxy, the path the fix for
  // https://github.com/ariakit/ariakit/issues/6308 keeps from crashing.
  // @ts-expect-error -- StringLike is not assignable to ReactNode.
  const rawFieldName: ReactNode = form.names.email;

  return (
    <ak.Form store={form}>
      <ak.FormLabel name={form.names.email}>Email</ak.FormLabel>
      <ak.FormInput type="email" name={form.names.email} required />

      <button type="button" onClick={() => setFieldNameVisible(true)}>
        Show field name
      </button>
      {fieldNameVisible && (
        <p>
          This value is submitted as{" "}
          <NameBoundary>
            <code>{rawFieldName}</code>
          </NameBoundary>
        </p>
      )}

      <button
        type="button"
        onClick={() =>
          setObjectTag(Object.prototype.toString.call(form.names.email))
        }
      >
        Inspect field name
      </button>
      {objectTag != null && <output>{objectTag}</output>}
    </ak.Form>
  );
}
