"use client";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react";
import { Hovercard, HovercardAnchor, HovercardProvider } from "@ariakit/react";
import Link from "next/link.js";
import type { LinkProps } from "next/link.js";
import { Popup } from "./popup.jsx";

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
  return (
    <HovercardProvider>
      <HovercardAnchor render={<Link {...props} ref={ref} href={href} />} />
      <Hovercard
        render={<Popup className="h-[320px] w-[420px]" />}
        portal
        unmountOnHide
      >
        {preview}
      </Hovercard>
    </HovercardProvider>
  );
});
