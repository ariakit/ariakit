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
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbSlot,
} from "@ariakit/ui/components/breadcrumb.ariakit.react";
import { House } from "lucide-react";
import { Fragment } from "react";
import type { AppTrail } from "#app/lib/trail.ts";
import { homeStep } from "#app/lib/trail.ts";

export interface AppBreadcrumbProps {
  trail: AppTrail;
}

/**
 * The trail above the title of a page. It renders the whole list in React,
 * because Astro would wrap children written in an Astro file in an element
 * between the list and its items.
 */
export function AppBreadcrumb({ trail }: AppBreadcrumbProps) {
  return (
    <Breadcrumb aria-label="Breadcrumb">
      <BreadcrumbLink
        href={homeStep.href}
        aria-label={homeStep.label}
        $hoverOffset
      >
        <BreadcrumbSlot>
          <House />
        </BreadcrumbSlot>
      </BreadcrumbLink>
      <BreadcrumbSeparator />
      {trail.steps.map((step) => (
        <Fragment key={step.href}>
          <BreadcrumbLink href={step.href}>{step.label}</BreadcrumbLink>
          <BreadcrumbSeparator />
        </Fragment>
      ))}
      <BreadcrumbCurrent>{trail.current}</BreadcrumbCurrent>
    </Breadcrumb>
  );
}
