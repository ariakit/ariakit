import { Badge, BadgeLabel } from "@ariakit/ui/components/badge.ariakit.react";
import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import {
  Input,
  InputGroup,
  InputSlot,
} from "@ariakit/ui/components/input.ariakit.react";
import { Kbd } from "@ariakit/ui/components/kbd.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import {
  Nav,
  NavGroup,
  NavGroupLabel,
  NavLink,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellHeader,
  ShellHeaderCenter,
  ShellFooter,
  ShellSidebar,
  ShellSidebarBody,
  ShellSidebarFooter,
  ShellSidebarHeader,
  ShellMain,
  ShellMainIntro,
  ShellMainBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import { BookOpen, Info, Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const navigationGroups = [
  {
    label: "Getting started",
    links: ["Create an account", "Invite your team", "Set up a workspace"],
  },
  {
    label: "Billing",
    links: ["Update payment method", "Download invoices", "Change plan"],
  },
  {
    label: "Troubleshooting",
    links: ["Sign-in problems", "Sync errors", "Email not arriving"],
  },
];

const articles = [
  {
    title: "Create an account",
    description:
      "Sign up with email or your work account in under two minutes.",
    category: "Getting started",
    readTime: "2 min read",
  },
  {
    title: "Invite your team",
    description:
      "Send invitations and choose which workspaces each member can open.",
    category: "Getting started",
    readTime: "3 min read",
  },
  {
    title: "Update payment method",
    description: "Replace an expired card or switch to an invoice-based plan.",
    category: "Billing",
    readTime: "2 min read",
  },
  {
    title: "Download invoices",
    description: "Find past invoices and export them as PDF for your records.",
    category: "Billing",
    readTime: "1 min read",
  },
  {
    title: "Sign-in problems",
    description:
      "Fix a locked account, a missing code, or a stale browser session.",
    category: "Troubleshooting",
    readTime: "4 min read",
  },
  {
    title: "Sync errors",
    description: "Understand why a change did not reach your other devices.",
    category: "Troubleshooting",
    readTime: "3 min read",
  },
];

const categoryLayers: Record<string, "brand" | "success" | "warning"> = {
  "Getting started": "brand",
  Billing: "success",
  Troubleshooting: "warning",
};

function toSlug(text: string) {
  return text.toLowerCase().replaceAll(" ", "-");
}

// Shared by the desktop sidebar and the mobile drawer.
function HelpNavigation() {
  return (
    <>
      <ShellSidebarBody>
        <Nav list={false} render={<div aria-label="Help sections" />}>
          {navigationGroups.map((group) => (
            <NavGroup key={group.label}>
              <NavGroupLabel>{group.label}</NavGroupLabel>
              <NavList>
                {group.links.map((link) => (
                  <NavLink key={link} href={`#${toSlug(link)}`}>
                    {link}
                  </NavLink>
                ))}
              </NavList>
            </NavGroup>
          ))}
        </Nav>
      </ShellSidebarBody>
      <ShellSidebarFooter>
        <Link href="#" className="text-sm">
          Contact support
        </Link>
      </ShellSidebarFooter>
    </>
  );
}

export default function Example() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const navigationId = useId();
  const toggleNavigation = () => setNavigationOpen((open) => !open);
  const closeNavigation = () => setNavigationOpen(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Pressing "/" outside a text field focuses the search, as the hint shows.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea")) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Shell>
      <ShellHeader
        $blur
        // A taller bar leaves room for the search row when it wraps below
        // 40rem.
        $stackCenter
        $height="lg"
        start={
          <>
            <Button
              className="@3xl/shell:hidden"
              aria-label="Toggle navigation"
              aria-expanded={navigationOpen}
              aria-controls={navigationId}
              onClick={toggleNavigation}
            >
              <ButtonSlot>
                <Menu />
              </ButtonSlot>
            </Button>
            <a href="#" className="flex items-center gap-2 font-semibold">
              <BookOpen strokeWidth={1.5} className="size-5" /> Acme Help
            </a>
          </>
        }
        center={
          <ShellHeaderCenter $grow>
            <InputGroup className="w-full min-w-0">
              <Input
                ref={searchRef}
                aria-label="Search help articles"
                placeholder="Search articles"
                className="min-w-0 flex-1"
              />
              <InputSlot $kind="shortcut" aria-hidden>
                <Kbd>/</Kbd>
              </InputSlot>
            </InputGroup>
          </ShellHeaderCenter>
        }
      />
      <ShellSidebar aria-label="Help navigation" render={<nav />}>
        <HelpNavigation />
      </ShellSidebar>
      <ShellSidebar
        id={navigationId}
        open={navigationOpen}
        $show="max-3xl"
        $width="lg"
        aria-label="Mobile help navigation"
        render={<nav />}
      >
        <ShellSidebarHeader className="flex items-center justify-between gap-2 px-4">
          <span className="font-semibold">Help topics</span>
          <Button aria-label="Close navigation" onClick={closeNavigation}>
            <ButtonSlot>
              <X />
            </ButtonSlot>
          </Button>
        </ShellSidebarHeader>
        <HelpNavigation />
      </ShellSidebar>
      <ShellMain>
        <ShellMainIntro>
          <Prose>
            <HeadingLevel>
              <Heading>Help center</Heading>
            </HeadingLevel>
            <p>
              Find answers about your account, billing, and workspace settings.
            </p>
            <Frame
              $layer="brand"
              $rounded="lg"
              $p={3}
              className="flex items-start gap-2 text-sm"
            >
              <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>
                Tip: resize this window below 48rem wide to replace the sidebar
                with a menu drawer, then select the menu button to open it.
              </span>
            </Frame>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <HeadingLevel level={2}>
            <div className="grid gap-4 @2xl/shell-main-body:grid-cols-2">
              {articles.map((article) => (
                <Frame
                  key={article.title}
                  $layer
                  $rounded="xl"
                  $p={4}
                  $border
                  className="flex flex-col gap-3"
                >
                  <Badge
                    $layer={categoryLayers[article.category]}
                    className="self-start"
                  >
                    <BadgeLabel>{article.category}</BadgeLabel>
                  </Badge>
                  <Heading className="text-lg font-semibold">
                    <a
                      href={`#${toSlug(article.title)}`}
                      className="hover:underline"
                    >
                      {article.title}
                    </a>
                  </Heading>
                  <p className="ak-ink-70 text-sm">{article.description}</p>
                  <span className="ak-ink-70 mt-auto text-xs">
                    {article.readTime}
                  </span>
                </Frame>
              ))}
            </div>
          </HeadingLevel>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter
        start={<span className="ak-ink-70 text-sm">© 2026 Acme Inc.</span>}
        end={
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="#">Status</Link>
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
          </div>
        }
      />
    </Shell>
  );
}
