import { icons } from "@/build-pages/icons.ts";
import { APIReference } from "@/icons/api-reference.tsx";
import { Document } from "@/icons/document.tsx";
import { camelCase } from "lodash-es";

export function getPageIcon(category: string, page?: string) {
  if (!page) return <Document />;
  if (category === "reference") return <APIReference />;
  const iconName = camelCase(`${category}/${page}`);
  const Icon = icons[iconName];
  if (!Icon) return;
  return <Icon />;
}
