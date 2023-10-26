"use client";
import { Suspense } from "react";
import { PlusScreen } from "components/plus-screen.jsx";

export default function Page() {
  return (
    <div className="flex flex-col items-center py-8 sm:py-16">
      <div className="w-full max-w-[952px] p-3">
        <Suspense
          fallback={
            <div className="h-[640px] animate-pulse rounded-xl bg-black/10 dark:bg-white/10" />
          }
        >
          <PlusScreen />
        </Suspense>
      </div>
    </div>
  );
}
