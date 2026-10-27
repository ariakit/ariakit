import {
  ButtonLabel,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import {
  Popover,
  PopoverDisclosure,
  PopoverProvider,
} from "@ariakit/ui/components/popover.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Toc, TocLink } from "@ariakit/ui/components/toc.ariakit.react";
import { ChevronDown } from "lucide-react";
import { Fragment, useState } from "react";

const headings = [
  { slug: "phone-ingredients", text: "Ingredients" },
  { slug: "phone-dough", text: "Make the dough" },
  { slug: "phone-rest", text: "Let it rest" },
  { slug: "phone-shape", text: "Shape the loaves" },
  { slug: "phone-bake", text: "Bake" },
  { slug: "phone-store", text: "Store the bread" },
];

export default function Example() {
  const [current, setCurrent] = useState<string | null>(null);
  const title = headings.find((heading) => `#${heading.slug}` === current);
  return (
    <Shell>
      <ShellHeader $blur $height="sm">
        <ShellHeaderStart>
          <PopoverProvider placement="bottom-start">
            {/* The button shows the section being read. The popover keeps
                the table of contents mounted while it's closed, so the
                current link stays up to date. */}
            <PopoverDisclosure>
              <ButtonLabel>{title?.text ?? "On this page"}</ButtonLabel>
              <ButtonSlot>
                <ChevronDown />
              </ButtonSlot>
            </PopoverDisclosure>
            <Popover aria-label="Table of contents" className="w-72">
              <Toc
                aria-label="On this page"
                $p="none"
                onCurrentChange={setCurrent}
              >
                {headings.map((heading) => (
                  <TocLink key={heading.slug} href={`#${heading.slug}`}>
                    {heading.text}
                  </TocLink>
                ))}
              </Toc>
            </Popover>
          </PopoverProvider>
        </ShellHeaderStart>
      </ShellHeader>
      <ShellMain>
        <ShellMainIntro>
          {/* The intro ends with the space that the first heading of the body
              drops from its top margin, as the other sections have. */}
          <Prose className="pb-[1.75em]">
            <Heading render={<h1 />}>Country bread</Heading>
            <p>A crusty loaf with a soft crumb, made over two days.</p>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose>
            {headings.map((heading) => (
              <Fragment key={heading.slug}>
                <Heading id={heading.slug} render={<h2 />}>
                  <a href={`#${heading.slug}`}>{heading.text}</a>
                </Heading>
                <p>
                  Take your time with this step. The dough tells you when it's
                  ready better than the clock does, so look at it and feel it
                  before you move on.
                </p>
                <p>
                  Keep the kitchen warm and the bowl covered, so the dough
                  doesn't dry out.
                </p>
                <p>
                  When the step is done, clean the bench and the tools, so they
                  are ready for the next one.
                </p>
                <p>
                  Write down the times and the temperature of the room. They
                  help you plan the next bake.
                </p>
              </Fragment>
            ))}
          </Prose>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}
