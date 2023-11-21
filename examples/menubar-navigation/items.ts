import type { MenubarProps } from "./menubar.jsx";

interface Item {
  label: string;
  href?: string;
  description?: string;
  placement?: MenubarProps["placement"];
  shift?: number;
  items?: Item[];
}

export const items: Item[] = [
  {
    label: "Services",
    href: "#/services",
    placement: "bottom-start",
    shift: -96,
    items: [
      {
        label: "Web Development",
        href: "#/webdev",
        description: "Professional web development services",
      },
      {
        label: "Mobile Development",
        href: "#/mobiledev",
        description: "High-quality mobile application development",
      },
    ],
  },
  {
    label: "Blog",
    placement: "bottom-start",
    shift: -192,
    items: [
      {
        label: "Categories",
        items: [
          {
            label: "Tech",
            href: "#/blog/tech",
            description: "Latest technology news and insights",
          },
          {
            label: "Business",
            href: "#/blog/business",
            description: "Business trends and market analysis",
          },
        ],
      },
      {
        label: "Archives",
        href: "#/blog/archives",
        description: "Access past blog articles",
      },
    ],
  },
  {
    label: "Company",
    items: [
      {
        label: "Info",
        items: [
          {
            label: "About Us",
            href: "#/aboutus",
            description: "Learn more about our company",
          },
        ],
      },
      {
        label: "Departments",
        items: [
          {
            label: "HR",
            href: "#/hr",
            description: "Jobs and career at our company",
          },
          {
            label: "Finance",
            href: "#/finance",
            description: "Financial and investor information",
          },
        ],
      },
    ],
  },
  {
    label: "Contact Us",
    href: "#/contactus",
  },
];
