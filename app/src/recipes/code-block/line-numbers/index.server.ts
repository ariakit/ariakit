import { highlight } from "@ariakit/ui/utils/highlight.server";

const source = `import { useEffect, useState } from "react";

/** Returns the value after it stops changing for \`delay\` milliseconds. */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}`;

export function load() {
  return { code: highlight(source, "ts") };
}
