import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import { Toc, TocLink } from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

const sections = [
  { slug: "overview", text: "Overview", paragraphs: 6 },
  { slug: "usage", text: "Usage", paragraphs: 6 },
  { slug: "styling", text: "Styling", paragraphs: 6 },
  { slug: "notes", text: "Notes", paragraphs: 1 },
  { slug: "credits", text: "Credits", paragraphs: 1 },
];

export default function Example() {
  return (
    <>
      {/* The root element clips its overflow, so the body scrolls on its own
          instead of the page, as in some app shells. React renders a style
          element only with one text child. */}
      <style>
        {
          "html { overflow: hidden; height: 100%; } body { overflow: auto; height: 100%; }"
        }
      </style>
      <div className="grid w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto] gap-8">
        <Prose>
          {sections.map((section) => (
            <Fragment key={section.slug}>
              <Heading id={section.slug} render={<h2 />} $level={4}>
                {section.text}
              </Heading>
              {Array.from({ length: section.paragraphs }, (_, index) => (
                <p key={index}>
                  The body scrolls this text. The short final sections can't
                  reach the top, so they become current near the end.
                </p>
              ))}
            </Fragment>
          ))}
        </Prose>
        <Toc label="On this page" className="sticky top-4 w-44 self-start">
          {sections.map((section) => (
            <TocLink key={section.slug} href={`#${section.slug}`}>
              {section.text}
            </TocLink>
          ))}
        </Toc>
      </div>
    </>
  );
}
