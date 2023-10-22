"use client";
import {
  Button,
  Menu,
  MenuButton,
  MenuButtonArrow,
  MenuItem,
  MenuProvider,
} from "@ariakit/react";
import { SignedIn, useSession, useUser } from "@clerk/clerk-react";
import { AriakitPlus } from "icons/ariakit-plus.jsx";
import Image from "next/image.js";
import Link from "next/link.js";
import { useSubscription } from "utils/use-subscription.js";
import { Command } from "./command.jsx";
import { Popup } from "./popup.jsx";

export function HeaderAriakitPlus() {
  const { isLoaded, user } = useUser();
  const { session } = useSession();
  const subscription = useSubscription();

  if (!isLoaded) return null;

  return (
    <>
      <Button
        // onClick={() => setOpen(true)}
        className="text-sm max-sm:w-10 max-sm:p-0"
        aria-label="Unlock Ariakit Plus"
        render={<Command variant="plus" render={<Link href="/plus" />} />}
      >
        <AriakitPlus className="-translate-y-px" />
        <span className="hidden sm:inline">
          Unlock <span className="font-semibold">Ariakit Plus</span>
        </span>
      </Button>
      <SignedIn>
        {user && (
          <MenuProvider placement="bottom-end">
            <MenuButton render={<Command variant="secondary" flat />}>
              <Image
                src={user.imageUrl}
                width={24}
                height={24}
                alt="Profile picture"
                className="overflow-hidden rounded-full"
              />
              <span className="hidden md:block">
                {user.fullName || "Ariakit Plus"}
              </span>
              <MenuButtonArrow className="hidden md:block" />
            </MenuButton>
            <Menu gutter={4} render={<Popup />}>
              <MenuItem render={<Link href="/profile" />}>
                Edit profile
              </MenuItem>
              {subscription && (
                <form
                  role="presentation"
                  method="post"
                  target="_blank"
                  action="/api/customer-portal"
                >
                  <MenuItem render={<button type="submit" />}>
                    Manage subscription
                  </MenuItem>
                </form>
              )}
              <MenuItem
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
