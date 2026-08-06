"use client";

import { Button } from "@ariakit/ui/html/button.react.tsx";
import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Button
        type="button"
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        Count: {count}
      </Button>
    </div>
  );
}
