import ChevronRight from "website/icons/chevron-right.jsx";
import NewWindow from "website/icons/new-window.jsx";

type Props = {
  size?: "sm" | "md";
};

export default function GlobalNotification({ size = "md" }: Props) {
  if (size === "sm") {
    return (
      <a
        href="https://newsletter.ariakit.org"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-8 items-center gap-2 truncate rounded-lg
        bg-black/5 px-2 text-sm hover:bg-black/10 focus-visible:ariakit-outline-input
        dark:bg-white/5 dark:hover:bg-white/10"
      >
        <div className="h-3 w-3 flex-none rounded-full bg-yellow-500" />
        <div className="min-w-0">
          This site is under construction{" "}
          <ChevronRight className="inline-block h-4 fill-black/40 dark:fill-white/40" />{" "}
          <span
            className="inline-flex items-center gap-1 font-medium text-blue-700 underline
            underline-offset-[0.125em] [text-decoration-skip-ink:none]
            group-hover:decoration-[3px] dark:font-normal dark:text-blue-400"
          >
            Subscribe to updates
            <NewWindow className="h-4 w-4 stroke-black/75 dark:stroke-white/75" />
          </span>
        </div>
      </a>
    );
  }
  return (
    <a
      href="https://newsletter.ariakit.org"
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-10 items-center gap-2 truncate rounded-lg bg-black/5 px-4 hover:bg-black/10 focus-visible:ariakit-outline-input dark:bg-white/5 dark:hover:bg-white/10"
    >
      <div className="h-3 w-3 flex-none rounded-full bg-yellow-500" />
      <div className="min-w-0">
        This site is under construction{" "}
        <ChevronRight className="inline-block h-4 fill-black/40 dark:fill-white/40" />{" "}
        <span
          className="inline-flex items-center gap-1 font-medium text-blue-700 underline
          underline-offset-[0.125em] [text-decoration-skip-ink:none]
          group-hover:decoration-[3px] dark:font-normal dark:text-blue-400"
        >
          Subscribe to our newsletter
          <NewWindow className="h-4 w-4 stroke-black/75 dark:stroke-white/75" />
        </span>{" "}
        to get major updates.
      </div>
    </a>
  );
}
