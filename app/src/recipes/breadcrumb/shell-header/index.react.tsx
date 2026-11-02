import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import {
  Heading,
  HeadingDescription,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
} from "@ariakit/ui/components/shell.ariakit.react";

const sections = [
  {
    title: "Before you start",
    text: "Check the blades for rust and wipe them with a dry cloth. A clean blade makes a clean cut, and a clean cut heals faster.",
  },
  {
    title: "Where to cut",
    text: "Cut just above a bud that faces away from the center of the plant. New growth then opens the plant to light and air.",
  },
  {
    title: "When to stop",
    text: "Remove no more than a third of the plant in one season. A plant that loses more can take years to recover.",
  },
  {
    title: "After the work",
    text: "Clean the blades again, oil the pivot, and store the shears closed. Sap left on a blade dries hard and dulls the edge.",
  },
];

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        {/* The header stays at the top while the page scrolls, so the way up
            stays in reach. */}
        <ShellMainHeader $blur>
          <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbLink href="#garden">Garden</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbLink href="#tools">Tools</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbCurrent>Pruning shears</BreadcrumbCurrent>
          </Breadcrumb>
        </ShellMainHeader>
        <ShellMainIntro>
          <Prose>
            <Heading>Pruning shears</Heading>
            <HeadingDescription>
              How to cut, clean, and store a pair of pruning shears.
            </HeadingDescription>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose>
            {[...sections, ...sections, ...sections].map((section, index) => (
              <div key={`${section.title}-${index}`} className="contents">
                <Heading render={<h2 />}>{section.title}</Heading>
                <p>{section.text}</p>
              </div>
            ))}
          </Prose>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}
