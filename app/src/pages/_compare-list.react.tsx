/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import {
  List,
  ListDisclosure,
  ListDisclosureButton,
  ListItem,
} from "@ariakit/ui/ariakit/list.react.tsx";
import {
  List as LegacyList,
  ListDisclosure as LegacyListDisclosure,
  ListDisclosureButton as LegacyListDisclosureButton,
  ListItem as LegacyListItem,
} from "#app/examples/_lib/ariakit/list.react.tsx";

export function CompareListLegacy() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <LegacyList>
        <LegacyListItem>Choose how to accept payments</LegacyListItem>
        <LegacyListItem>Create a one-off product</LegacyListItem>
        <LegacyListItem>View Checkout docs</LegacyListItem>
      </LegacyList>
      <LegacyList>
        <LegacyListItem checked>Verify your email</LegacyListItem>
        <LegacyListItem progress={0.6}>Complete your profile</LegacyListItem>
        <LegacyListItem checked={false}>Send your invoice</LegacyListItem>
      </LegacyList>
      <LegacyList ordered>
        <LegacyListItem>
          <p>Install the CLI and authenticate with your account.</p>
        </LegacyListItem>
        <LegacyListItem>
          <p>Create a project and link it to your repository.</p>
        </LegacyListItem>
        <LegacyListItem>
          <p>Deploy and watch the build logs.</p>
        </LegacyListItem>
      </LegacyList>
      <LegacyList ordered>
        <LegacyListItem>
          <h4 className="font-semibold">Set up payments</h4>
          <p>Connect a payment provider to start charging.</p>
        </LegacyListItem>
        <LegacyListItem>
          <h4 className="font-semibold">Go live</h4>
          <p>Switch to production keys and launch.</p>
        </LegacyListItem>
      </LegacyList>
      <LegacyList>
        <li>
          <LegacyListDisclosure
            defaultOpen
            button={
              <LegacyListDisclosureButton
                indicator="chevron-down-next"
                progress={0.5}
              >
                Set up invoices
              </LegacyListDisclosureButton>
            }
          >
            <LegacyList>
              <LegacyListItem checked>Add your branding</LegacyListItem>
              <LegacyListItem checked={false}>Create an invoice</LegacyListItem>
            </LegacyList>
          </LegacyListDisclosure>
        </li>
        <li>
          <LegacyListDisclosure
            button={
              <LegacyListDisclosureButton
                indicator="chevron-down-next"
                progress={1}
              >
                Set up payments
              </LegacyListDisclosureButton>
            }
          >
            <LegacyList>
              <LegacyListItem checked>
                Choose how to accept payments
              </LegacyListItem>
            </LegacyList>
          </LegacyListDisclosure>
        </li>
      </LegacyList>
      <LegacyList ordered>
        <li>
          <LegacyListDisclosure
            defaultOpen
            button={
              <LegacyListDisclosureButton indicator="chevron-down-next">
                Create your account
              </LegacyListDisclosureButton>
            }
          >
            <p>Sign up with your email and confirm it.</p>
          </LegacyListDisclosure>
        </li>
        <li>
          <LegacyListDisclosure
            button={
              <LegacyListDisclosureButton indicator="chevron-down-next">
                Invite your team
              </LegacyListDisclosureButton>
            }
          >
            <p>Send invitations from the members page.</p>
          </LegacyListDisclosure>
        </li>
      </LegacyList>
    </div>
  );
}

export function CompareListNew() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <List>
        <ListItem>Choose how to accept payments</ListItem>
        <ListItem>Create a one-off product</ListItem>
        <ListItem>View Checkout docs</ListItem>
      </List>
      <List>
        <ListItem checked>Verify your email</ListItem>
        <ListItem progress={0.6}>Complete your profile</ListItem>
        <ListItem checked={false}>Send your invoice</ListItem>
      </List>
      <List ordered>
        <ListItem>
          <p>Install the CLI and authenticate with your account.</p>
        </ListItem>
        <ListItem>
          <p>Create a project and link it to your repository.</p>
        </ListItem>
        <ListItem>
          <p>Deploy and watch the build logs.</p>
        </ListItem>
      </List>
      <List ordered>
        <ListItem>
          <h4 className="font-semibold">Set up payments</h4>
          <p>Connect a payment provider to start charging.</p>
        </ListItem>
        <ListItem>
          <h4 className="font-semibold">Go live</h4>
          <p>Switch to production keys and launch.</p>
        </ListItem>
      </List>
      <List>
        <li>
          <ListDisclosure
            defaultOpen
            button={
              <ListDisclosureButton progress={0.5}>
                Set up invoices
              </ListDisclosureButton>
            }
          >
            <List>
              <ListItem checked>Add your branding</ListItem>
              <ListItem checked={false}>Create an invoice</ListItem>
            </List>
          </ListDisclosure>
        </li>
        <li>
          <ListDisclosure
            button={
              <ListDisclosureButton progress={1}>
                Set up payments
              </ListDisclosureButton>
            }
          >
            <List>
              <ListItem checked>Choose how to accept payments</ListItem>
            </List>
          </ListDisclosure>
        </li>
      </List>
      <List ordered>
        <li>
          <ListDisclosure
            defaultOpen
            button={
              <ListDisclosureButton>Create your account</ListDisclosureButton>
            }
          >
            <p>Sign up with your email and confirm it.</p>
          </ListDisclosure>
        </li>
        <li>
          <ListDisclosure
            button={
              <ListDisclosureButton>Invite your team</ListDisclosureButton>
            }
          >
            <p>Send invitations from the members page.</p>
          </ListDisclosure>
        </li>
      </List>
    </div>
  );
}
