"use client";

import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <button
        type="button"
        className="ak-button"
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        Count: {count}
      </button>
    </div>
  );
}
