import { GlobalNotification } from "components/global-notification.js";
import { Hero } from "components/hero.js";
import { NewsletterForm } from "components/newsletter-form.jsx";
import { NewWindow } from "icons/new-window.jsx";

export default function Page() {
  return (
    <>
      <div className="flex justify-center p-3 sm:p-4">
        <GlobalNotification />
      </div>

      <Hero />

      <div className="p-3 sm:p-8">
        <div className="sm:rounded-x mx-auto grid w-full max-w-6xl grid-cols-1 justify-between gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-pink-50 p-4 dark:from-blue-600/30 dark:via-blue-600/0 dark:to-blue-600/0 sm:grid-cols-2 sm:gap-10 sm:p-10 md:gap-20 md:rounded-2xl md:p-16">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl">
              Newsletter
            </h2>
            <p className="text-black/80 dark:font-light dark:text-white/80">
              Join 1,000+ subscribers and receive monthly{" "}
              <strong className="font-medium text-black dark:text-white">
                tips &amp; updates
              </strong>{" "}
              on new Ariakit content.
            </p>
            <p>
              <a
                href="https://newsletter.ariakit.org/latest"
                target="_blank"
                className="relative -mb-1.5 -mt-1 rounded-sm pb-1.5 pt-1 font-medium text-blue-700 underline decoration-1 underline-offset-[0.25em] [text-decoration-skip-ink:none] hover:decoration-[3px] focus-visible:no-underline focus-visible:ariakit-outline-input dark:font-normal dark:text-blue-400 [&>code]:text-blue-900 [&>code]:dark:text-blue-300"
                rel="noreferrer"
              >
                Read latest issue
                <NewWindow className="mb-0.5 ml-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
              </a>
            </p>
          </div>
          <NewsletterForm location="home" className="flex flex-col gap-3">
            <div className="flex gap-3 sm:flex-col sm:gap-4">
              <input
                className="h-10 w-full flex-1 rounded border-none bg-white px-4 text-black placeholder-black/60 shadow-input focus-visible:ariakit-outline-input sm:h-12 sm:flex-none sm:rounded-md sm:px-5 sm:text-lg"
                type="email"
                name="email"
                required
                placeholder="Your email address"
              />
              <button className="h-10 !cursor-pointer whitespace-nowrap rounded bg-blue-600 px-4 text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline sm:h-12 sm:rounded-md sm:px-5 sm:text-lg">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-70 sm:text-center">
              No Spam. Unsubscribe at any time.
            </p>
          </NewsletterForm>
        </div>
      </div>
    </>
  );
}
