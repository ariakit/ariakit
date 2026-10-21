import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  SkeletonBox,
  SkeletonLine,
} from "@ariakit/ui/components/skeleton.ariakit.react";
import { TextFrame } from "@ariakit/ui/components/text-frame.ariakit.react";
import { Bell, Hexagon } from "lucide-react";
import { useState } from "react";

const pages = ["Overview", "Projects", "Deployments", "Analytics", "Settings"];

export default function Example() {
  const [current, setCurrent] = useState("Overview");
  return (
    <Shell>
      <ShellHeader
        $blur
        start={
          // An icon starts the logo, so its sides keep the frame padding, like
          // the leading icon of a button.
          <TextFrame
            $p={2}
            $px="sm"
            className="flex items-center gap-2 font-semibold"
          >
            <Hexagon strokeWidth={1.5} className="size-5" aria-hidden />
            Acme
          </TextFrame>
        }
        center={
          // The header stretches the navigation to its height, so the bar sits
          // on the header's bottom edge. The links scroll when they need more
          // room than the header has.
          <Nav aria-label="Main" $layout="horizontal" bar>
            {pages.map((page) => (
              <NavLink
                key={page}
                href={`#${page.toLowerCase()}`}
                aria-current={current === page ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setCurrent(page);
                }}
              >
                {page}
              </NavLink>
            ))}
          </Nav>
        }
        end={
          <>
            <Button aria-label="Notifications">
              <ButtonSlot>
                <Bell />
              </ButtonSlot>
            </Button>
            <Button aria-label="Account" className="rounded-full p-0">
              <ButtonSlot $kind="avatar" $layer="brand" aria-hidden>
                MR
              </ButtonSlot>
            </Button>
          </>
        }
      />
      <ShellMain $maxWidth="64rem">
        <ShellMainIntro>
          <Heading>{current}</Heading>
        </ShellMainIntro>
        <ShellMainBody>
          <div aria-hidden className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <SkeletonBox $rounded="xl" className="h-24" />
              <SkeletonBox $rounded="xl" className="h-24" />
              <SkeletonBox $rounded="xl" className="h-24" />
            </div>
            <SkeletonBox $rounded="xl" className="h-56" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-2/3" />
          </div>
        </ShellMainBody>
      </ShellMain>
    </Shell>
  );
}
