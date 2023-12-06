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
import { NewWindow } from "icons/new-window.jsx";
import Link from "next/link.js";
import { useSelectedLayoutSegments } from "next/navigation.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";
import { DropdownItem } from "./dropdown-item.jsx";
import { Popup } from "./popup.jsx";

export function HeaderAriakitPlus() {
  const clerk = useClerk();
  const subscription = useSubscription();
  const segments = useSelectedLayoutSegments();

  const isFree = subscription.isFetched && !subscription.data;
  const isPlus = subscription.isFetched && !!subscription.data;

  return (
    <>
      <ClerkLoading>
        <div className="h-10 w-10 animate-pulse rounded-lg bg-black/10 dark:bg-white/10 sm:w-28" />
      </ClerkLoading>
      <SignedOut>
        {!segments.includes("plus") && (
          <Button
            className="text-sm max-sm:px-3"
            aria-label="Unlock Ariakit Plus"
            render={
              <Command
                variant="plus"
                render={<Link href="/plus" scroll={false} />}
              />
            }
          >
            <span className="hidden sm:inline">
              Unlock <span className="font-semibold">Ariakit Plus</span>
            </span>
            <span className="inline font-semibold sm:hidden">Plus</span>
          </Button>
        )}
      </SignedOut>
      <SignedIn>
        <MenuProvider placement="bottom-end" animated>
          <MenuButton
            className="px-3 text-sm"
            render={<Command variant="plus" />}
          >
            <span className="font-semibold">Plus</span>
            <MenuButtonArrow className="hidden md:block" />
          </MenuButton>
          <Menu
            gutter={4}
            shift={-8}
            unmountOnHide
            className="origin-top-right animate-in fade-in zoom-in-95 data-[leave]:animate-out data-[leave]:fade-out data-[leave]:zoom-out-95"
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
                >
                  <MenuItem
                    render={<DropdownItem render={<button type="submit" />} />}
                  >
                    <span className="pr-4">Subscription</span>
                    <NewWindow className="h-4 w-4 opacity-75" />
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
