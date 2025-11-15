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

export interface ReferenceLabelProps {
  kind: Reference["kind"] | "prop";
  symbols?: boolean;
  colors?: boolean;
  children?: ReactNode;
}

const labelColors = {
  component: { dark: "#4EC9B0", light: "#005CC5" },
  function: { dark: "#DCDCAA", light: "#6F42C1" },
  store: { dark: "#DCDCAA", light: "#6F42C1" },
  prop: { dark: "#9CDCFE", light: "#6F42C1" },
};

const symbolColors = {
  parenthesis: { dark: "#D4D4D4", light: "#24292E" },
  brackets: { dark: "#808080", light: "#24292E" },
};

export function getReferenceLabelText(
  kind: ReferenceLabelProps["kind"],
  name: string,
) {
  const isFunction = kind === "function" || kind === "store";
  const isComponent = kind === "component";
  const left = isComponent ? "<" : "";
  const right = isComponent ? ">" : isFunction ? "()" : "";
  return `${left}${name}${right}`;
}

export function getReferenceLabelColors(kind: ReferenceLabelProps["kind"]) {
  const kindColors = labelColors[kind];
  const className = "ak-text-(--dark)/50 ak-light:ak-text-(--light)/65";
  const getStyle = (color: typeof kindColors) => {
    return {
      "--dark": color.dark,
      "--light": color.light,
    } as React.CSSProperties;
  };
  return { kindColors, className, style: getStyle(kindColors), getStyle };
}

export function ReferenceLabel(props: ReferenceLabelProps) {
  const labelColors = getReferenceLabelColors(props.kind);
  const isFunction = props.kind === "function" || props.kind === "store";
  const isComponent = props.kind === "component";

  const className = props.colors ? labelColors.className : "ak-text/0";

  const getStyle = (kindColors = labelColors.kindColors) => {
    if (!props.colors) return {};
    return labelColors.getStyle(kindColors);
  };

  return (
    <span>
      {props.symbols && isComponent && (
        <span style={getStyle(symbolColors.brackets)} className={className}>
          &lt;
        </span>
      )}
      <span style={getStyle()} className={props.colors ? className : ""}>
        {props.children}
      </span>
      {props.symbols && isComponent && (
        <span style={getStyle(symbolColors.brackets)} className={className}>
          &gt;
        </span>
      )}
      {props.symbols && isFunction && (
        <span style={getStyle(symbolColors.parenthesis)} className={className}>
          ()
        </span>
      )}
    </span>
  );
}
