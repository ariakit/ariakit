/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { ReactNode } from "react";
import type { Reference } from "#app/lib/schemas.ts";

export interface ApiReferenceLabelProps {
  kind: Reference["kind"];
  withSymbols?: boolean;
  children?: ReactNode;
}

export function ApiReferenceLabel({
  kind,
  withSymbols = false,
  children,
}: ApiReferenceLabelProps) {
  const colors = {
    component: { dark: "#4EC9B0", light: "#005CC5" },
    function: { dark: "#DCDCAA", light: "#6F42C1" },
    store: { dark: "#DCDCAA", light: "#6F42C1" },
  };

  const symbolColors = {
    parenthesis: { dark: "#D4D4D4", light: "#24292E" },
    brackets: { dark: "#808080", light: "#24292E" },
  };

  const kindColors = colors[kind];
  const className = "ak-text-(--dark)/50 ak-light:ak-text-(--light)/65";

  const getStyle = (color: typeof kindColors) => {
    return {
      "--dark": color.dark,
      "--light": color.light,
    } as React.CSSProperties;
  };

  return (
    <span>
      {withSymbols && kind === "component" && (
        <span style={getStyle(symbolColors.brackets)} className={className}>
          &lt;
        </span>
      )}
      <span style={getStyle(kindColors)} className={className}>
        {children}
      </span>
      {withSymbols && kind === "component" && (
        <span style={getStyle(symbolColors.brackets)} className={className}>
          &gt;
        </span>
      )}
      {withSymbols && (kind === "function" || kind === "store") && (
        <span style={getStyle(symbolColors.parenthesis)} className={className}>
          ()
        </span>
      )}
    </span>
  );
}
