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
  symbols?: boolean;
  colors?: boolean;
  children?: ReactNode;
}

export function getApiReferencePlainLabel(
  kind: Reference["kind"],
  name: string,
) {
  const isFunction = kind === "function" || kind === "store";
  const isComponent = kind === "component";
  const left = isComponent ? "<" : "";
  const right = isComponent ? ">" : isFunction ? "()" : "";
  return `${left}${name}${right}`;
}

const labelColors = {
  component: { dark: "#4EC9B0", light: "#005CC5" },
  function: { dark: "#DCDCAA", light: "#6F42C1" },
  store: { dark: "#DCDCAA", light: "#6F42C1" },
};

const symbolColors = {
  parenthesis: { dark: "#D4D4D4", light: "#24292E" },
  brackets: { dark: "#808080", light: "#24292E" },
};

export function ApiReferenceLabel(props: ApiReferenceLabelProps) {
  const kindColors = labelColors[props.kind];
  const className = props.colors
    ? "ak-text-(--dark)/50 ak-light:ak-text-(--light)/65"
    : "ak-text/0";

  const getStyle = (color: typeof kindColors) => {
    if (!props.colors) return {};
    return {
      "--dark": color.dark,
      "--light": color.light,
    } as React.CSSProperties;
  };

  const isFunction = props.kind === "function" || props.kind === "store";
  const isComponent = props.kind === "component";

  return (
    <span>
      {props.symbols && isComponent && (
        <span style={getStyle(symbolColors.brackets)} className={className}>
          &lt;
        </span>
      )}
      <span
        style={getStyle(kindColors)}
        className={props.colors ? className : ""}
      >
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
