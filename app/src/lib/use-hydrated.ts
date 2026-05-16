/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { useSafeLayoutEffect } from "@ariakit/react-core/utils/hooks";
import { useState } from "react";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useSafeLayoutEffect(() => setHydrated(true), []);
  return hydrated;
}
