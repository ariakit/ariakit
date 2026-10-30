import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Tooltip } from "@ariakit/ui/components/tooltip.ariakit.react";
import { useEffect, useId, useState } from "react";

const documents = [
  "Roadmap",
  "Design review notes for the new onboarding flow",
  "Hiring plan",
  "Customer interviews from the October research trip to Lisbon, Porto, and Madrid",
];

function getHref(name: string) {
  return `#${name.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

interface TruncatedLinkProps {
  href: string;
  children: string;
}

function TruncatedLink({ href, children }: TruncatedLinkProps) {
  const [element, setElement] = useState<HTMLAnchorElement | null>(null);
  const [truncated, setTruncated] = useState(false);

  // The text is cut off when it is wider than the link. A change of the link's
  // width can cut it off or show all of it.
  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setTruncated(element.scrollWidth > element.clientWidth);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);

  return (
    // The tooltip opens to the right, so it doesn't cover the next link in the
    // list. It also fits the viewport, so a long title wraps instead of going
    // off the screen there.
    <Tooltip text={truncated ? children : null} placement="right" fitViewport>
      <Link ref={setElement} href={href} className="block truncate">
        {children}
      </Link>
    </Tooltip>
  );
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
            <TruncatedLink href={getHref(name)}>{name}</TruncatedLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
