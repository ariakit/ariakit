import Showcase from "../components/showcase/index.jsx";
import GlobalNotification from "./components/global-notification.jsx";
import Hero from "./components/hero.jsx";

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
