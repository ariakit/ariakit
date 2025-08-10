/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import * as Core from "@ariakit/core/hovercard/hovercard-store";
import * as ak from "@ariakit/react";
import clsx from "clsx";
import { getPortalRoot } from "#app/lib/get-portal-root.ts";

// Create a single global core store that can be shared across the app.
// We keep it at module scope so every import references the same instance.
const hovercardStore = Core.createHovercardStore({ timeout: 250 });

export type HovercardSingletonAnchorProps = ak.HovercardAnchorProps;

export function HovercardSingletonAnchor(props: HovercardSingletonAnchorProps) {
  const store = ak.useHovercardStore({ store: hovercardStore });
  return <ak.HovercardAnchor store={store} {...props} />;
}

export interface HovercardSingletonProps
  extends Omit<ak.HovercardProps, "store"> {}

export function HovercardSingleton({
  className,
  ...props
}: HovercardSingletonProps) {
  const store = ak.useHovercardStore({ store: hovercardStore });
  return (
    <ak.Hovercard
      store={store}
      unmountOnHide
      portalElement={getPortalRoot}
      {...props}
      className={clsx(
        "ak-popover data-open:ak-popover_open not-data-open:ak-popover_closed max-w-80 origin-(--popover-transform-origin)",
        className,
      )}
    />
  );
}
