import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Toc,
  TocItem,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        {/* The shell gives the headings a scroll margin, which sets where a
            clicked heading lands. That is where its link becomes current. Each
            heading also links to itself, as on documentation pages. */}
        <ShellMainBody>
          {/* The article text gets smaller in a narrow frame, so the sidebar
              keeps its room beside it. */}
          <Prose className="text-[length:clamp(0.625rem,2.5cqi,1rem)]">
            <Heading id="overview" render={<h2 />}>
              <a href="#overview">Overview</a>
            </Heading>
            <p>
              A combobox is a text input with a list of options. It filters the
              options as the user types, and keeps the focus on the input while
              the arrow keys move through the list.
            </p>
            <p>
              Use it when a select would be too long to scan, or when users know
              the name of the option they want.
            </p>
            <Heading id="installation" render={<h2 />}>
              <a href="#installation">Installation</a>
            </Heading>
            <p>
              Install the package with your package manager, then import the
              components from it. The components work with server rendering.
            </p>
            <p>
              The package has no peer dependencies other than React, and its
              styles come from the style recipes that you copy into your app.
            </p>
            <Heading id="usage" render={<h2 />}>
              <a href="#usage">Usage</a>
            </Heading>
            <p>
              Wrap the input and the popover in a provider. The provider holds
              the value and the open state, and the parts read them from it.
            </p>
            <p>
              Each part renders one element, so you can put your own elements
              between them, such as a label above the input or a footer at the
              end of the popover.
            </p>
            <Heading id="basic-example" render={<h3 />}>
              <a href="#basic-example">Basic example</a>
            </Heading>
            <p>
              The simplest combobox filters a static list. Pass the matches to
              the popover and render an item for each one.
            </p>
            <p>
              Typing opens the popover. Escape closes it and keeps the text in
              the input. The{" "}
              <Link href="https://ariakit.org/components/combobox">
                combobox component page
              </Link>{" "}
              lists every prop.
            </p>
            <Heading id="controlled-state" render={<h3 />}>
              <a href="#controlled-state">Controlled state</a>
            </Heading>
            <p>
              Pass the value and its setter to the provider to read the value
              while the user types, such as to load matches from a server.
            </p>
            <p>
              The parts still change the value, and the provider tells you each
              change.
            </p>
            <Heading id="styling" render={<h2 />}>
              <a href="#styling">Styling</a>
            </Heading>
            <p>
              Every part renders one element and takes a class name. The open
              popover and the active item have attributes for their states.
            </p>
            <p>
              The style recipes set the colors, the spacing, and the motion, and
              each one takes props for its variants.
            </p>
            <p>
              The colors come from the surface around the combobox, so the same
              parts work on a light page, a dark page, and a colored card.
            </p>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $show
        $from="body"
        $border={false}
        $layer="transparent"
      >
        <ShellSidebarBody>
          <Toc label="On this page" $cover>
            <TocLink href="#overview">Overview</TocLink>
            <TocLink href="#installation">Installation</TocLink>
            <TocItem>
              <TocLink href="#usage">Usage</TocLink>
              <TocList>
                <TocLink href="#basic-example">Basic example</TocLink>
                <TocLink href="#controlled-state">Controlled state</TocLink>
              </TocList>
            </TocItem>
            <TocLink href="#styling">Styling</TocLink>
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
