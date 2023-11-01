"use client";
import { createContext, forwardRef, useContext } from "react";
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react";
import {
  Hovercard,
  HovercardAnchor,
  HovercardProvider,
  useHovercardStore,
} from "@ariakit/react";
import Link from "next/link.js";
import type { LinkProps } from "next/link.js";
import { twMerge } from "tailwind-merge";
import { Popup } from "./popup.jsx";

const LevelContext = createContext(0);

export interface PreviewLinkClientProps
  extends ComponentPropsWithoutRef<"a">,
    Omit<LinkProps, "href"> {
  href: string;
  preview?: ReactNode;
}

export const PreviewLinkClient = forwardRef<
  ElementRef<typeof Link>,
  PreviewLinkClientProps
>(function PreviewLinkClient({ href, preview, ...props }, ref) {
  const store = useHovercardStore();
  const mounted = store.useState("mounted");
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
  return (
    <LevelContext.Provider value={level}>
      <HovercardProvider>
        <HovercardAnchor render={<Link {...props} ref={ref} href={href} />} />
        {mounted && (
          <Hovercard
            render={<Popup className="h-[320px] w-[420px]" />}
            portal
            // unmountOnHide
          >
            {preview}
          </Hovercard>
        )}
      </HovercardProvider>
    </LevelContext.Provider>
  );
});
