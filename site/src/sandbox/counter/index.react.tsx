import { useState } from "react";

export default function Example() {
  const [count, setCount] = useState(0);
  return (
    <button
      type="button"
      className="ak-button"
      onClick={() => {
        setCount((count) => count + 1);
      }}
    >
      Count: {count}
    </button>
  );
}
