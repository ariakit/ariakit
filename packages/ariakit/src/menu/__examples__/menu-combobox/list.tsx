import { Icon } from "@wordpress/icons";
import * as icons from "@wordpress/icons";

export const list = [
  {
    value: "Paragraph",
    icon: <Icon icon={icons.paragraph} fill="currentColor" />,
  },
  {
    value: "Heading",
    icon: <Icon icon={icons.heading} fill="currentColor" />,
  },
  {
    value: "List",
    icon: <Icon icon={icons.list} fill="currentColor" />,
  },
  {
    value: "Quote",
    icon: <Icon icon={icons.quote} fill="currentColor" />,
  },
  {
    value: "Classic",
    icon: <Icon icon={icons.classic} fill="currentColor" />,
  },
  {
    value: "Code",
    icon: <Icon icon={icons.code} fill="currentColor" />,
  },
  {
    value: "Preformatted",
    icon: <Icon icon={icons.preformatted} fill="currentColor" />,
  },
  {
    value: "Pullquote",
    icon: <Icon icon={icons.pullquote} fill="currentColor" />,
  },
  {
    value: "Table",
    icon: <Icon icon={icons.table} fill="currentColor" />,
  },
  {
    value: "Verse",
    icon: <Icon icon={icons.verse} fill="currentColor" />,
  },
  {
    value: "Image",
    icon: <Icon icon={icons.image} fill="currentColor" />,
  },
  {
    value: "Gallery",
    icon: <Icon icon={icons.gallery} fill="currentColor" />,
  },
  {
    value: "Audio",
    icon: <Icon icon={icons.audio} fill="currentColor" />,
  },
  {
    value: "Cover",
    icon: <Icon icon={icons.cover} fill="currentColor" />,
  },
  {
    value: "File",
    icon: <Icon icon={icons.file} fill="currentColor" />,
  },
  {
    value: "Media & Text",
    icon: <Icon icon={icons.mediaAndText} fill="currentColor" />,
  },
  {
    value: "Video",
    icon: <Icon icon={icons.video} fill="currentColor" />,
  },
  {
    value: "Buttons",
    icon: <Icon icon={icons.buttons} fill="currentColor" />,
  },
  {
    value: "Columns",
    icon: <Icon icon={icons.columns} fill="currentColor" />,
  },
  {
    value: "Group",
    icon: <Icon icon={icons.group} fill="currentColor" />,
  },
  {
    value: "More",
    icon: <Icon icon={icons.more} fill="currentColor" />,
  },
  {
    value: "Page Break",
    icon: <Icon icon={icons.pageBreak} fill="currentColor" />,
  },
  {
    value: "Separator",
    icon: <Icon icon={icons.separator} fill="currentColor" />,
  },
  {
    value: "Archives",
    icon: <Icon icon={icons.archive} fill="currentColor" />,
  },
  {
    value: "Calendar",
    icon: <Icon icon={icons.calendar} fill="currentColor" />,
  },
  {
    value: "Categories",
    icon: <Icon icon={icons.category} fill="currentColor" />,
  },
  {
    value: "Latest Comments",
    icon: <Icon icon={icons.comment} fill="currentColor" />,
  },
  {
    value: "Latest Posts",
    icon: <Icon icon={icons.postList} fill="currentColor" />,
  },
  {
    value: "Page List",
    icon: <Icon icon={icons.pages} fill="currentColor" />,
  },
  {
    value: "RSS",
    icon: <Icon icon={icons.rss} fill="currentColor" />,
  },
  {
    value: "Search",
    icon: <Icon icon={icons.search} fill="currentColor" />,
  },
  {
    value: "Shortcode",
    icon: <Icon icon={icons.shortcode} fill="currentColor" />,
  },
  {
    value: "Social Icons",
    icon: <Icon icon={icons.share} fill="currentColor" />,
  },
  {
    value: "Tag Cloud",
    icon: <Icon icon={icons.tag} fill="currentColor" />,
  },
];

export const defaultList = list.map((item) => item.value);

export function getIcon(value: string) {
  return list.find((item) => item.value === value)?.icon;
}
