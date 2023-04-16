import { icons } from "build-pages/icons.js";
import { camelCase } from "lodash-es";

export function getPageIcon(category: string, page: string) {
  const iconName = camelCase(`${category}/${page}`);
  const Icon = icons[iconName];
  if (!Icon) return;
  return <Icon />;
}
