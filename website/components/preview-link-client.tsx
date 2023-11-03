"use client";
import {
  Suspense,
  createContext,
  forwardRef,
  useContext,
  useState,
  useTransition,
} from "react";
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react";
import { Hovercard, HovercardAnchor, HovercardProvider } from "@ariakit/react";
import Link from "next/link.js";
import type { LinkProps } from "next/link.js";
import { twMerge } from "tailwind-merge";
import { Popup } from "./popup.jsx";

const LevelContext = createContext(0);

export interface PreviewLinkClientProps
  extends ComponentPropsWithoutRef<"a">,
    Omit<LinkProps, "href"> {
  href: string;
  preview?: () => Promise<ReactNode>;
}

export const PreviewLinkClient = forwardRef<
  ElementRef<typeof Link>,
  PreviewLinkClientProps
>(function PreviewLinkClient({ href, preview, ...props }, ref) {
  const [isPending, startTransition] = useTransition();
  const [node, setNode] = useState<ReactNode>();

  const level = useContext(LevelContext) + 1;
  if (level > 2) {
    return (
      <Link
        {...props}
        ref={ref}
        href={href}
        className={twMerge(props.className, "decoration-solid")}
      />
    );
  }
  // TODO: RSC doesn't work. We need to do everything at the end of the page
  // markdown file. Maybe using cache
  // (https://github.com/manvalls/server-only-context/blob/main/src/index.ts) to
  // set the preview paths in child components (like CodeBlocks).
  return (
    <LevelContext.Provider value={level}>
      <HovercardProvider
        setMounted={(mounted) => {
          if (!mounted) return;
          if (!preview) return;
          startTransition(async () => {
            const node = await preview();
            setNode(node);
          });
        }}
      >
        <HovercardAnchor render={<Link {...props} ref={ref} href={href} />} />
        <Hovercard
          render={<Popup className="h-[320px] w-[420px]" />}
          portal
          unmountOnHide
          data-pending={isPending ? true : undefined}
        >
          <Suspense>{node}</Suspense>
        </Hovercard>
      </HovercardProvider>
    </LevelContext.Provider>
  );
});
