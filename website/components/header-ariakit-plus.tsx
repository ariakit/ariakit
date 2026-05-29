"use client";
import {
  Button,
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuProvider,
  MenuSeparator,
} from "@ariakit/react";
import {
  ClerkLoading,
  SignedIn,
  SignedOut,
  useClerk,
} from "@clerk/clerk-react";
import Link from "next/link.js";
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments,
} from "next/navigation.js";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, Suspense } from "react";
import { NewWindow } from "@/icons/new-window.tsx";
import { useSubscription } from "@/lib/use-subscription.ts";
import { Command } from "./command.tsx";
import { DropdownItem } from "./dropdown-item.tsx";
import { Popup } from "./popup.tsx";

const SignInLink = forwardRef<
  ElementRef<typeof Link>,
  Omit<ComponentPropsWithoutRef<typeof Link>, "href">
>(function SignInLink(props, ref) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.size ? `?${searchParams}` : "";
  return (
    <Link
      ref={ref}
      href={`/sign-in?redirect_url=${encodeURIComponent(
        `${pathname}?${search}`,
      )}`}
      {...props}
    />
  );
});

export function HeaderAriakitPlus() {
  const clerk = useClerk();
  const subscription = useSubscription();
  const segments = useSelectedLayoutSegments();

  const isFree = subscription.isFetched && !subscription.data;
  const isPlus = subscription.isFetched && !!subscription.data;

  return (
    <>
      <ClerkLoading>
        <div className="mx-2 h-6 w-10 animate-pulse rounded bg-black/10 sm:mx-3 sm:w-28 dark:bg-white/10" />
      </ClerkLoading>
      <SignedOut>
        {segments.length === 1 && segments.includes("plus") ? (
          <Suspense>
            <Command
              flat
              variant="secondary"
              className="border border-solid border-black/60 px-3 font-medium outline-offset-2 focus-visible:![outline:2px_solid_theme(colors.blue.600)] sm:h-9 dark:border-white/60"
              render={<SignInLink />}
            >
              Sign in
            </Command>
          </Suspense>
        ) : (
          <Button
            className="max-sm:px-3"
            aria-label="Unlock Ariakit Plus"
            render={
              <Command
                flat
                variant="secondary"
                render={<Link href="/plus" scroll={false} />}
              />
            }
          >
            <span className="hidden sm:inline">
              Unlock <span className="font-medium">Ariakit Plus</span>
            </span>
            <span className="inline font-medium sm:hidden">Plus</span>
          </Button>
        )}
      </SignedOut>
      <SignedIn>
        <MenuProvider placement="bottom-end">
          <MenuButton
            className="px-3"
            render={<Command flat variant="secondary" />}
          >
            Plus
            <MenuButtonArrow className="hidden md:block [&>svg]:stroke-[1pt]" />
          </MenuButton>
          <Menu
            gutter={4}
            shift={-8}
            unmountOnHide
            className="min-w-40 origin-top-right data-[open]:animate-in data-[leave]:animate-out data-[leave]:fade-out data-[open]:fade-in data-[leave]:zoom-out-95 data-[open]:zoom-in-95"
            render={<Popup />}
          >
            <MenuItem
              render={<DropdownItem render={<Link href="/profile" />} />}
            >
              Profile
            </MenuItem>
            {isFree && (
              <MenuItem
                render={
                  <DropdownItem render={<Link href="/plus" scroll={false} />} />
                }
              >
                Unlock Ariakit Plus
              </MenuItem>
            )}
            {isPlus && (
              <>
                <MenuItem
                  render={
                    <DropdownItem
                      render={<Link href="/plus" scroll={false} />}
                    />
                  }
                >
                  Benefits
                </MenuItem>
                <form
                  role="presentation"
                  method="post"
                  target="_blank"
                  action="/api/customer-portal"
                  rel="noopener"
                >
                  <MenuItem
                    className="w-full"
                    render={<DropdownItem render={<button type="submit" />} />}
                  >
                    <span className="flex-1 pr-4 text-left">Billing</span>
                    <NewWindow className="size-4 opacity-75" />
                  </MenuItem>
                </form>
              </>
            )}
            <MenuSeparator className="my-2 border-gray-250 dark:border-gray-600" />
            <MenuItem
              className="hover:cursor-pointer"
              render={<DropdownItem />}
              onClick={() => clerk.signOut()}
            >
              Sign out
            </MenuItem>
          </Menu>
        </MenuProvider>
      </SignedIn>
    </>
  );
}
