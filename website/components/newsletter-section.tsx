import { Mail } from "@/icons/mail.tsx";
import { NewWindow } from "@/icons/new-window.tsx";
import { Command } from "./command.tsx";
import { InlineLink } from "./inline-link.tsx";
import { NewsletterForm } from "./newsletter-form.tsx";

export function NewsletterSection() {
  return (
    <div className="relative mt-24 border-t border-black/10 px-3 py-10 sm:mt-40 sm:py-16 sm:pt-12 dark:border-white/10">
      <div className="mx-auto flex flex-col items-center gap-6 px-3 text-center sm:gap-8">
        <Mail className="absolute top-0 mx-auto size-12 -translate-y-1/2 bg-gray-50 stroke-black/40 stroke-1 p-2 dark:bg-gray-800 dark:stroke-white/40" />
        <h2 className="flex items-center gap-2 text-xl font-medium sm:text-2xl">
          Stay tuned
        </h2>
        <div className="flex flex-col items-center gap-2 text-black/80 max-sm:text-sm dark:text-white/80">
          <p className="text-balance">
            Join 1,000+ subscribers and receive monthly{" "}
            <strong className="font-medium text-black dark:text-white">
              tips &amp; updates
            </strong>{" "}
            on new Ariakit content.
          </p>
          <p>
            No spam. Unsubscribe anytime.{" "}
            <InlineLink
              href="https://newsletter.ariakit.org/latest"
              target="_blank"
              rel="noreferrer"
            >
              Read latest issue
              <span className="whitespace-nowrap">
                &#x2060;
                <NewWindow className="mb-0.5 ml-0.5 inline h-[1em] w-[1em] stroke-black/60 dark:stroke-white/60" />
              </span>
            </InlineLink>
          </p>
        </div>
        <NewsletterForm
          location="home"
          className="grid w-full max-w-[400px] grid-cols-[1fr_max-content] gap-2"
        >
          <input
            className="rounded-md border-none bg-white px-4 text-black placeholder-black/60 outline-2 outline-offset-[-1px] outline-blue-600 [box-shadow:inset_0_0_0_1px_rgba(0_0_0/0.15),inset_0_2px_5px_0_rgba(0_0_0/0.08)] hover:bg-gray-50 focus-visible:outline dark:bg-gray-850 dark:text-white dark:placeholder-white/55 dark:[box-shadow:inset_0_0_0_1px_rgba(255_255_255/0.15),inset_0_-1px_0_0_rgba(255_255_255/0.05),inset_0_2px_5px_0_rgba(0_0_0/0.15)] dark:hover:bg-gray-900"
            type="email"
            name="email"
            required
            placeholder="Your email address"
          />
          <Command
            type="submit"
            flat
            variant="primary"
            className="cursor-pointer rounded-md focus-visible:!ariakit-outline"
          >
            Subscribe
          </Command>
        </NewsletterForm>
      </div>
    </div>
  );
}
