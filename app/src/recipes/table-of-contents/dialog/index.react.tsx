import {
  Dialog,
  DialogDisclosure,
  DialogDismiss,
  DialogHeading,
  DialogProvider,
  DialogScroll,
} from "@ariakit/ui/components/dialog.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderEnd,
  ShellHeaderStart,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Toc, TocLink } from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

const terms = [
  {
    slug: "terms-accounts",
    title: "Accounts",
    body: "You need an account to use the service. Keep your password safe, and tell us if someone else uses your account.",
  },
  {
    slug: "terms-payments",
    title: "Payments",
    body: "Paid plans renew each month until you cancel them. You can change your plan at any time, and the change takes effect on the next renewal.",
  },
  {
    slug: "terms-content",
    title: "Your content",
    body: "You own the content that you upload. You give us the right to store it and show it to the people that you share it with.",
  },
  {
    slug: "terms-privacy",
    title: "Privacy",
    body: "We collect the data that the service needs to work. The privacy policy tells which data we keep, for how long, and how to delete it.",
  },
  {
    slug: "terms-termination",
    title: "Termination",
    body: "You can close your account at any time. We can close an account that breaks these terms, and we tell you before we do.",
  },
  {
    slug: "terms-changes",
    title: "Changes to these terms",
    body: "We tell you about important changes a month before they take effect. If you keep using the service after that, the new terms apply.",
  },
];

// The terms get smaller in a narrow dialog, so the sidebar keeps its room
// beside them.
const articleClass = "text-[length:clamp(0.625rem,2.5cqi,1rem)]";

export default function Example() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <DialogProvider>
        <DialogDisclosure>Read the terms</DialogDisclosure>
        {/* A shell fills the dialog with a sticky header and a sticky table
            of contents. The viewport scrolls the terms, so the table of
            contents watches it. The dialog takes its full height, and the
            viewport is a size container, so the sidebar fits the viewport
            instead of the window. The viewport scrolls smoothly with CSS. */}
        <Dialog
          $p="none"
          className="flex flex-col [--dialog-max-width:52rem]"
          style={{ height: "var(--dialog-max-height)" }}
        >
          {/* In a frame, Chrome can paint the blurred header outside the
              rounded corners of the scrolling viewport, so the viewport also
              clips its corners. */}
          <DialogScroll className="grow @container-size [clip-path:inset(0_round_var(--ak-frame-radius))] motion-safe:scroll-smooth">
            <Shell>
              {/* The dismiss button keeps the inset of the header, which keeps
                  it concentric with the corner of the dialog. The title lines
                  up with the wider padding of the terms, and truncates rather
                  than wrap and grow the header. */}
              <ShellHeader $blur $height="sm">
                <ShellHeaderStart
                  $shrink
                  className="ps-[calc(var(--spacing)*6-var(--shell-bar-inset))]"
                >
                  <DialogHeading className="truncate">
                    Terms of service
                  </DialogHeading>
                </ShellHeaderStart>
                <ShellHeaderEnd>
                  <DialogDismiss />
                </ShellHeaderEnd>
              </ShellHeader>
              <ShellMain $p={6}>
                <ShellMainBody>
                  <Prose className={articleClass}>
                    {terms.map((term) => (
                      <Fragment key={term.slug}>
                        <Heading id={term.slug} render={<h3 />}>
                          <a href={`#${term.slug}`}>{term.title}</a>
                        </Heading>
                        <p>{term.body}</p>
                        <p>
                          These terms apply to every plan, and to the apps on
                          every device that you use the service with.
                        </p>
                        <p>
                          If a part of these terms can't be enforced, the other
                          parts still apply.
                        </p>
                      </Fragment>
                    ))}
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
                <ShellSidebarBody $p={6}>
                  <Toc label="Sections" $guide="rail" $cover>
                    {terms.map((term) => (
                      <TocLink key={term.slug} href={`#${term.slug}`}>
                        {term.title}
                      </TocLink>
                    ))}
                  </Toc>
                </ShellSidebarBody>
              </ShellSidebar>
            </Shell>
          </DialogScroll>
        </Dialog>
      </DialogProvider>
    </div>
  );
}
