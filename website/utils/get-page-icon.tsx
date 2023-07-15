import { icons } from "build-pages/icons.js";
import { APIReference } from "icons/api-reference.jsx";
import { Document } from "icons/document.jsx";
import { camelCase } from "lodash-es";

export function getPageIcon(category: string, page?: string) {
  if (!page) return <Document />;
  if (category === "reference") return <APIReference />;
  const iconName = camelCase(`${category}/${page}`);
  const Icon = icons[iconName];
  if (!Icon) return;
  return <Icon />;
}
