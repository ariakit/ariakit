"use client";
import { Button, Dialog } from "@ariakit/react";
import { Show } from "@clerk/nextjs";
import Link from "next/link.js";
import { usePathname, useRouter, useSearchParams } from "next/navigation.js";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, Suspense } from "react";
import { AuthEnabled } from "@/components/auth.tsx";
import { Command } from "@/components/command.tsx";
import { PlusScreen } from "@/components/plus-screen.tsx";
import { useRootPathname } from "@/components/root-pathname.tsx";
import { ArrowLeft } from "@/icons/arrow-left.tsx";

const SignInLink = forwardRef<
  ElementRef<typeof Link>,
  Omit<ComponentPropsWithoutRef<typeof Link>, "href">
>(function SignInLink(props, ref) {
  const rootPathname = useRootPathname();
  const searchParams = useSearchParams();
  const search = searchParams.size ? `?${searchParams}` : "";
  const hasCheckout = searchParams.has("checkout");
  // Resume the checkout dialog on /plus when there's an active checkout, so
  // the post-sign-in redirect always lands back on the Plus surface and the
  // dialog re-opens via the searchParams below. Otherwise return to the
  // underlying page; Next 16's parallel-route handling can resolve
  // rootPathname to /plus when it can't determine the underlying route, in
  // which case fall back to / so we don't loop the user back into Plus.
  const target = hasCheckout
    ? `/plus${search}`
    : `${rootPathname === "/plus" ? "/" : rootPathname}${search}`;
  return (
    <Link
      ref={ref}
      href={`/sign-in?redirect_url=${encodeURIComponent(target)}`}
      {...props}
    />
  );
});

export default function Page() {
  return (
    <AuthEnabled>
      <Suspense>
        <Modal />
      </Suspense>
    </AuthEnabled>
  );
}

function Modal() {
  const router = useRouter();
  const pathname = usePathname();
  const rootPathname = useRootPathname();
  const searchParams = useSearchParams();
  const hasCheckout = searchParams.has("checkout");
  return (
    <Dialog
      // Force the dialog open when ?checkout= is present so the checkout
      // resumes after a hard navigation (e.g. Clerk sign-in redirect) even
      // when the parallel @modal slot has lost its interception context.
      open={pathname === "/plus" && (rootPathname !== "/plus" || hasCheckout)}
      backdrop={false}
      onClose={(event) => {
        event.preventDefault();
        router.back();
      }}
      className="mx-auto mb-20 mt-0 flex flex-col gap-[76px] outline-none ease-in-out animate-in fade-in zoom-in-95 lg:max-w-[952px]"
      render={(props) => (
        <div
          hidden={props.hidden}
          className="fixed inset-0 z-50 overflow-auto bg-gray-50/70 px-3 animate-in fade-in [-webkit-backdrop-filter:blur(16px)] [backdrop-filter:blur(16px)] dark:bg-gray-800/80"
        >
          <div {...props} />
        </div>
      )}
    >
      <header className="flex w-full flex-none items-center justify-between py-2 md:py-4">
        <Button
          className="px-3"
          onClick={router.back}
          render={<Command variant="secondary" flat />}
        >
          <ArrowLeft className="size-4" />
          Back to page
          <div className="-mr-1.5 hidden rounded-md border border-black/10 px-1.5 py-0.5 text-black/80 sm:block dark:border-white/10 dark:text-white/80">
            esc
          </div>
        </Button>
        <Show when="signed-out">
          <Suspense>
            <div className="flex items-center gap-2">
              <span className="hidden sm:block">Already purchased? </span>
              <Command
                flat
                variant="secondary"
                className="border border-solid border-black/60 px-3 font-medium focus-visible:!ariakit-outline sm:h-9 dark:border-white/60"
                render={<SignInLink />}
              >
                Sign in
              </Command>
            </div>
          </Suspense>
        </Show>
      </header>
      <Suspense>
        <PlusScreen />
      </Suspense>
    </Dialog>
  );
}
