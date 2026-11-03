import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { useId } from "react";

const articles = [
  "How we cut our build times in half",
  "What three years of support tickets taught us about onboarding, pricing pages, and the emails that people actually read",
  "A field guide to accessible color palettes for data visualization in dashboards with dark and light themes",
];

function getHref(title: string) {
  return `#${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="grid w-64 max-w-full grid-cols-1 gap-3"
    >
      <h2 id={headingId} className="text-sm font-medium">
        Latest articles
      </h2>
      <ul className="grid grid-cols-1 gap-3 text-sm">
        {articles.map((title) => (
          <li key={title}>
            <Tooltip text={title} placement="right" fitViewport>
              <Link href={getHref(title)} className="block">
                {/* The link pads its text for the focus ring, where a clamp on
                    the link would show part of the next line. The span clamps
                    the text instead. The taller lines keep the thicker
                    underline of a hovered link inside each line, so the clamp
                    doesn't cut it off on the last one. */}
                <TruncatedText className="line-clamp-2 leading-[1.75]">
                  {title}
                </TruncatedText>
              </Link>
            </Tooltip>
          </li>
        ))}
      </ul>
    </section>
  );
}
