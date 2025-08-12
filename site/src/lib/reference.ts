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

const sectionIdToKindMap = {
  state: "state",
  "required-props": "prop",
  "optional-props": "prop",
  parameters: "parameter",
  "return-value": "return-prop",
} as const;

const sectionIdToTitleMap = {
  state: "State",
  "required-props": "Required Props",
  "optional-props": "Optional Props",
  parameters: "Parameters",
  "return-value": "Return Value",
} as const satisfies Record<ReferenceSectionId, string>;

export type ReferenceSectionId = keyof typeof sectionIdToKindMap;
export type ReferenceItemKind = (typeof sectionIdToKindMap)[ReferenceSectionId];
export type ReferenceSectionTitle =
  (typeof sectionIdToTitleMap)[ReferenceSectionId];

export interface ReferenceItem extends ReferenceProp {
  id: string;
  kind: ReferenceItemKind;
  sectionId: ReferenceSectionId;
}

export interface ReferenceSection {
  id: ReferenceSectionId;
  title: ReferenceSectionTitle;
  type?: string;
  description?: string;
  items?: ReferenceItem[];
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

export function getReferenceItemKind(sectionId: ReferenceSectionId) {
  return sectionIdToKindMap[sectionId];
}

export function getReferenceItemId(itemKind: ReferenceItemKind, name?: string) {
  if (!name) return itemKind;
  return `${itemKind}-${slugify(name)}`;
}

export function getReferenceItemFromProp(
  sectionId: ReferenceSectionId,
  prop: ReferenceProp,
): ReferenceItem {
  const kind = getReferenceItemKind(sectionId);
  return {
    ...prop,
    id: getReferenceItemId(kind, prop.name),
    kind,
    sectionId,
  };
}

export function getReferenceSections(reference: Reference) {
  const sections: ReferenceSection[] = [];
  const pushSection = (
    id: ReferenceSectionId,
    items: ReferenceProp[] = [],
    init: Partial<ReferenceSection> = {},
  ) => {
    sections.push({
      id,
      title: sectionIdToTitleMap[id],
      items: items.map((item) => getReferenceItemFromProp(id, item)),
      ...init,
    });
  };
  if (reference.state?.length) {
    pushSection("state", reference.state, {
      description:
        "State values available on the store. You can subscribe to a specific key or derive values with a selector.",
    });
  }
  const propsParam = getPropsParam(reference);
  if (propsParam) {
    const requiredProps = propsParam.props.filter((prop) => !prop.optional);
    const optionalProps = propsParam.props.filter((prop) => prop.optional);
    if (requiredProps.length) {
      pushSection("required-props", requiredProps);
    }
    if (optionalProps.length) {
      pushSection("optional-props", optionalProps);
    }
  } else if (reference.params.length) {
    pushSection("parameters", reference.params);
  }
  if (reference.returnValue) {
    const rv = reference.returnValue;
    pushSection("return-value", rv.props, {
      description: rv.description,
      type: rv.type,
    });
  }
  return sections;
}

export function getReferenceItem(
  reference: Reference | ReferenceSection[],
  itemId: string,
) {
  const sections = Array.isArray(reference)
    ? reference
    : getReferenceSections(reference);
  for (const section of sections) {
    for (const sectionItem of section.items ?? []) {
      if (
        sectionItem.id !== itemId &&
        sectionItem.id.replace(`${sectionItem.kind}-`, "").replace(/-/g, "") !==
          itemId
      ) {
        continue;
      }
      return sectionItem;
    }
  }
  return;
}

export function getReferenceItems(
  reference: Reference | ReferenceSection[],
): ReferenceItem[] {
  const sections = Array.isArray(reference)
    ? reference
    : getReferenceSections(reference);
  return sections.flatMap((section) => section.items ?? []);
}

export function getReferenceContent(
  entry: CollectionEntry<"references">,
): ReferenceContent {
  const data = entry.data;
  const sections = getReferenceSections(data);
  return { ...data, sections };
}

export function getReferenceSlug(entry: CollectionEntry<"references">) {
  const { framework, component } = entry.data;
  const prefix = `${framework}/${component}/`;
  return entry.id.replace(prefix, "");
}
