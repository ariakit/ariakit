export function NewsletterForm() {
  return (
    <div className="flex flex-col gap-4 rounded bg-gradient-to-br from-blue-100 to-pink-100 p-4 dark:from-blue-600/30 dark:to-pink-600/30">
      <p className="text-sm">
        Join 1,000+ subscribers and receive monthly updates on new Ariakit
        content.
      </p>
      <form
        action="https://newsletter.ariakit.org/api/v1/free?email="
        method="post"
        target="_blank"
      >
        <div className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="Your email address"
            className="h-10 w-full flex-1 scroll-mt-96 rounded border-none bg-white px-4 text-base text-black placeholder-black/60 focus-visible:ariakit-outline-input"
          />
          <button className="flex h-10 cursor-pointer scroll-mt-96 items-center justify-center gap-2 whitespace-nowrap rounded bg-blue-600 px-4 text-white shadow-xl hover:bg-blue-800 focus-visible:ariakit-outline">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  );
}
