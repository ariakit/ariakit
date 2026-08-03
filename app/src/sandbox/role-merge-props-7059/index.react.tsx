import * as Ariakit from "@ariakit/react";
import * as React from "react";

interface Payload {
  __proto__: {
    key: string;
  };
}

interface StatefulInputProps extends React.ComponentProps<"input"> {
  __proto__?: Payload["__proto__"];
}

function isPayload(value: unknown): value is Payload {
  if (!value || typeof value !== "object") return false;

  const descriptor = Object.getOwnPropertyDescriptor(value, "__proto__");
  if (!descriptor?.enumerable) return false;

  const prototypeValue: unknown = descriptor.value;
  if (!prototypeValue || typeof prototypeValue !== "object") return false;

  return typeof Reflect.get(prototypeValue, "key") === "string";
}

function parsePayload(revision: number) {
  const value: unknown = JSON.parse(
    `{"__proto__":{"key":"payload-${revision}"}}`,
  );
  if (!isPayload(value)) {
    throw new Error("Invalid payload");
  }
  return value;
}

const StatefulInput = React.forwardRef<HTMLInputElement, StatefulInputProps>(
  function StatefulInput(props, ref) {
    return <input ref={ref} aria-label={props["aria-label"]} />;
  },
);

export default function Example() {
  const [revision, setRevision] = React.useState(0);
  const payload = parsePayload(revision);
  const { __proto__: _prototypeValue, ...safePayload } = payload;

  return (
    <div>
      <Ariakit.Role
        render={<StatefulInput {...safePayload} aria-label="Profile name" />}
      />
      <button type="button" onClick={() => setRevision((value) => value + 1)}>
        Refresh payload
      </button>
    </div>
  );
}
