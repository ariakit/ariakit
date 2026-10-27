import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Toc, TocLink } from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

const releases = Array.from({ length: 24 }, (_, index) => {
  const minor = 24 - index;
  return {
    slug: `version-2-${minor}`,
    title: `Version 2.${minor}.0`,
  };
});

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        <ShellMainBody>
          {/* The article text gets smaller in a narrow frame, so the sidebar
              keeps its room beside it. */}
          <Prose className="text-[length:clamp(0.625rem,2.5cqi,1rem)]">
            {releases.map((release) => (
              <Fragment key={release.slug}>
                <Heading id={release.slug} render={<h2 />}>
                  <a href={`#${release.slug}`}>{release.title}</a>
                </Heading>
                <p>
                  Fixes and improvements to the combobox, the menu, and the
                  select. The popover keeps its place when the page scrolls.
                </p>
              </Fragment>
            ))}
          </Prose>
        </ShellMainBody>
      </ShellMain>
      {/* The list is taller than the sidebar body, which scrolls. When the
          rows of the sections on screen leave the body, the body scrolls by
          itself to keep them in view, the current link first, and the page
          keeps its place. */}
      <ShellSidebar
        $side="end"
        $show
        $from="body"
        $border={false}
        $layer="transparent"
      >
        <ShellSidebarBody>
          <Toc label="Releases" $cover>
            {releases.map((release) => (
              <TocLink key={release.slug} href={`#${release.slug}`}>
                {release.title}
              </TocLink>
            ))}
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
