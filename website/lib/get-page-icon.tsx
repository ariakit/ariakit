import { camelCase } from "lodash-es";
import { icons } from "@/build-pages/icons.ts";
import { images } from "@/build-pages/images.ts";
import { ThemeImage } from "@/components/theme-image.tsx";
import { APIReference } from "@/icons/api-reference.tsx";
import { Document } from "@/icons/document.tsx";

export function getPageIcon(category: string, page?: string) {
  if (!page) return <Document />;
  if (category === "reference") return <APIReference />;
  const iconName = camelCase(`${category}/${page}`);
  const imageNameLight = camelCase(`${iconName}SmallLight`);
  const imageNameDark = camelCase(`${iconName}SmallDark`);
  const imageLight = images[imageNameLight];
  const imageDark = images[imageNameDark];
  if (imageLight && imageDark) {
    return (
      <ThemeImage
        alt=""
        src={{ light: imageLight, dark: imageDark }}
        placeholder="blur"
      />
    );
  }
  const Icon = icons[iconName];
  if (!Icon) return;
  return <Icon />;
}
