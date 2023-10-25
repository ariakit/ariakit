"use client";
import { PlusScreen } from "components/plus-screen.jsx";

export default function Page() {
  return (
    <div className="flex flex-col items-center py-8 sm:py-16">
      <div className="m-3 max-w-[952px]">
        <PlusScreen />
      </div>
    </div>
  );
}
