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
import { SignedIn, useSession, useUser } from "@clerk/clerk-react";
import { AriakitPlus } from "icons/ariakit-plus.jsx";
import { NewWindow } from "icons/new-window.jsx";
import Link from "next/link.js";
import { useSelectedLayoutSegments } from "next/navigation.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";
import { DropdownItem } from "./dropdown-item.jsx";
import { Popup } from "./popup.jsx";

export function HeaderAriakitPlus() {
  const { isLoaded, user } = useUser();
  const { session } = useSession();
  const subscription = useSubscription();
  const segments = useSelectedLayoutSegments();

  if (!isLoaded) return null;

  const isFree = subscription.isFetched && !subscription.data;
  const isPlus = subscription.isFetched && !!subscription.data;

  return (
    <>
      {!segments.includes("plus") && !user && (
        <Button
          className="text-sm animate-in fade-in zoom-in-95 max-sm:w-10 max-sm:p-0"
          aria-label="Unlock Ariakit Plus"
          render={
            <Command
              variant="plus"
              render={<Link href="/plus" scroll={false} />}
            />
          }
        >
          <AriakitPlus className="-translate-y-px" />
          <span className="hidden sm:inline">
            Unlock <span className="font-semibold">Ariakit Plus</span>
          </span>
        </Button>
      )}
      <SignedIn>
        {user && (
          <MenuProvider placement="bottom-end" animated>
            <MenuButton
              className="px-3"
              render={<Command variant="secondary" flat />}
            >
              <span className="block md:hidden">
                <AriakitPlus className="-translate-y-px" />
              </span>
              <span className="hidden md:block">Plus</span>
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
                    <DropdownItem
                      render={<Link href="/plus" scroll={false} />}
                    />
                  }
                >
                  Unlock Ariakit Plus
                </MenuItem>
              )}
              {isPlus && (
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
              )}
              <MenuSeparator className="my-2 border-gray-250 dark:border-gray-600" />
              <MenuItem
                className="hover:cursor-pointer"
                render={<DropdownItem />}
                onClick={async () => {
                  await session?.remove();
                  location.reload();
                }}
              >
                Sign out
              </MenuItem>
            </Menu>
          </MenuProvider>
        )}
      </SignedIn>
    </>
  );
}
