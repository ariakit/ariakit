"use client";

import GlobalNotification from "../components/global-notification";
import Hero from "../components/hero";
import Showcase from "../components/showcase";

export default function Page() {
  return (
    <>
      <div className="flex justify-center p-3 sm:p-4">
        <GlobalNotification />
      </div>
      <Hero />
      <Showcase />
    </>
  );
}
