import { GlobalNotification } from "components/global-notification.js";
import { Hero } from "components/hero.js";

export default function Page() {
  return (
    <>
      <div className="flex justify-center p-3 sm:p-4">
        <GlobalNotification />
      </div>
      <Hero />
    </>
  );
}
