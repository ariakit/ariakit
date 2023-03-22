import GlobalNotification from "website/components/global-notification.jsx";
import Hero from "website/components/hero.jsx";

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
