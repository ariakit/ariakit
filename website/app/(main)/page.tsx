import { GlobalNotification } from "@/components/global-notification.tsx";
import { Hero } from "@/components/hero.tsx";
import { HomeTagsGrid } from "@/components/home-tags-grid.tsx";

export default function Page() {
  return (
    <>
      <div className="flex justify-center p-3 sm:p-4">
        <GlobalNotification />
      </div>
      <Hero />
      <HomeTagsGrid />
    </>
  );
}
