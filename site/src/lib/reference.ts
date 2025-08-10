/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { CollectionEntry } from "astro:content";
import type { Reference, ReferenceProp } from "./schemas.ts";
import { slugify } from "./string.ts";

export type ReferenceSectionItem = ReferenceProp;

export type ReferenceItemKind = "state" | "prop" | "parameter" | "return-prop";

export interface ReferenceSection {
  id: string;
  type?: string;
  title: string;
  items?: ReferenceSectionItem[];
  itemKind?: ReferenceItemKind;
  description?: string;
}

export interface ReferenceContent extends Reference {
  sections: ReferenceSection[];
}

export function getPropsParam(data: Reference) {
  if (data.params.length !== 1) return null;
  const param = data.params[0];
  if (!param) return null;
  if (param.name !== "props") return null;
  if (!param.props?.length) return null;
  return {
    ...param,
    props: param.props,
  };
}

export function getReferenceSections(data: Reference) {
  const sections: ReferenceSection[] = [];
  if (data.state?.length) {
    sections.push({
      id: "state",
      title: "State",
      itemKind: "state",
      items: data.state,
      description:
        "State values available on the store. You can subscribe to a specific key or derive values with a selector.",
    });
  }
  const propsParam = getPropsParam(data);
  if (propsParam) {
    const requiredProps = propsParam.props.filter((p) => !p.optional);
    const optionalProps = propsParam.props.filter((p) => p.optional);
    if (requiredProps.length) {
      sections.push({
        id: "required-props",
        title: "Required Props",
        itemKind: "prop",
        items: requiredProps,
      });
    }
    if (optionalProps.length) {
      sections.push({
        id: "optional-props",
        title: "Optional Props",
        itemKind: "prop",
        items: optionalProps,
      });
    }
  } else if (data.params.length > 0) {
    sections.push({
      id: "parameters",
      title: "Parameters",
      itemKind: "parameter",
      items: data.params,
    });
  }
  if (data.returnValue) {
    const rv = data.returnValue;
    sections.push({
      id: "return-value",
      title: "Return Value",
      itemKind: "return-prop",
      description: rv.description,
      type: rv.type,
      items: rv.props,
    });
  }
  return sections;
}

export function getReferenceContent(
  entry: CollectionEntry<"references">,
): ReferenceContent {
  const data = entry.data;
  const sections = getReferenceSections(data);
  return { ...data, sections };
}

export function getReferenceItemId(prefix: string, name?: string) {
  if (!name) return prefix;
  return `${prefix}-${slugify(name)}`;
}

export function getReferenceSlug(reference: CollectionEntry<"references">) {
  const { framework, component } = reference.data;
  const prefix = `${framework}/${component}/`;
  return reference.id.replace(prefix, "");
}

export function getReferenceItemIds(reference: CollectionEntry<"references">) {
  const anchors = new Set<string>();
  const data = reference.data;
  if (data.state?.length) {
    for (const prop of data.state) {
      anchors.add(getReferenceItemId("state", prop.name));
    }
  }
  const propsParam = getPropsParam(data);
  if (propsParam) {
    for (const prop of propsParam.props) {
      anchors.add(getReferenceItemId("prop", prop.name));
    }
  } else if (data.params.length > 0) {
    for (const param of data.params) {
      anchors.add(getReferenceItemId("parameter", param.name));
    }
  }
  if (data.returnValue) {
    for (const prop of data.returnValue.props ?? []) {
      anchors.add(getReferenceItemId("return-prop", prop.name));
    }
  }
  return anchors;
}
