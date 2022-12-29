import Showcase from "../components/showcase";
import GlobalNotification from "./components/global-notification";
import Hero from "./components/hero";

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
