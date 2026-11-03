import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { TruncatedText } from "@ariakit/ui/components/truncated-text.ariakit.react";
import { useId } from "react";

const documents = [
  "Roadmap",
  "Design review notes for the new onboarding flow",
  "Hiring plan",
  "Customer interviews from the October research trip to Lisbon, Porto, and Madrid",
];

function getHref(name: string) {
  return `#${name.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  const headingId = useId();
  return (
    // The single grid columns can shrink below the text width, so the links
    // can cut it off.
    <section
      aria-labelledby={headingId}
      className="grid w-56 grid-cols-1 gap-3"
    >
      <h2 id={headingId} className="text-sm font-medium">
        Recent documents
      </h2>
      <ul className="grid grid-cols-1 gap-2 text-sm">
        {documents.map((name) => (
          <li key={name}>
            {/* The tooltip opens to the right, so it doesn't cover the next
                link in the list. It also fits the viewport, so a long title
                wraps instead of going off the screen there. */}
            <Tooltip text={name} placement="right" fitViewport>
              {/* The link cuts its own text off, so it is the anchor and the
                  truncated text. */}
              <TruncatedText
                render={
                  <Link href={getHref(name)} className="block truncate" />
                }
              >
                {name}
              </TruncatedText>
            </Tooltip>
          </li>
        ))}
      </ul>
    </section>
  );
}
