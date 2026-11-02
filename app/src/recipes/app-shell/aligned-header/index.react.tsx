import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Heading,
  HeadingDescription,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Input, InputGroup } from "@ariakit/ui/components/input.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellContent,
  ShellEnd,
  ShellFooter,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainHeader,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { ChevronRight, Hexagon, PanelLeft, Share2 } from "lucide-react";
import { Fragment, useId, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(true);
  const sidebarId = useId();
  return (
    <Shell>
      <ShellHeader $blur>
        <ShellStart>
          <Button
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls={sidebarId}
            onClick={() => setOpen(!open)}
            className="@max-3xl/shell:hidden"
          >
            <ButtonSlot>
              <PanelLeft />
            </ButtonSlot>
          </Button>
          <a href="#" className="flex items-center gap-2 font-semibold">
            <Hexagon strokeWidth={1.5} className="size-5" />
            Acme Docs
          </a>
        </ShellStart>
        <ShellContent>
          <InputGroup>
            <Input aria-label="Search the docs" placeholder="Search the docs" />
          </InputGroup>
        </ShellContent>
        <ShellEnd>
          <Button>Sign in</Button>
        </ShellEnd>
      </ShellHeader>
      <ShellSidebar
        id={sidebarId}
        open={open}
        landmark="nav"
        aria-label="Guides"
      >
        <ShellSidebarBody>
          <Nav $cover bar={{ $offset: "halfway" }}>
            {sections.map((section, index) => (
              <NavLink
                key={section.id}
                href={`#${section.id}`}
                aria-current={index === 0 ? "page" : undefined}
              >
                {section.title}
              </NavLink>
            ))}
          </Nav>
        </ShellSidebarBody>
      </ShellSidebar>
      <ShellMain>
        <ShellMainHeader $blur>
          <ShellContent>
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center gap-1.5 text-sm">
                <li className="ak-ink-70">Guides</li>
                <li aria-hidden className="ak-ink-70">
                  <ChevronRight className="size-3.5" />
                </li>
                <li aria-current="page">Getting started</li>
              </ol>
            </nav>
          </ShellContent>
          <ShellEnd>
            <Button aria-label="Share this page">
              <ButtonSlot>
                <Share2 />
              </ButtonSlot>
            </Button>
          </ShellEnd>
        </ShellMainHeader>
        <ShellMainIntro>
          <Prose>
            <Heading>Getting started</Heading>
            <HeadingDescription>
              Everything you need to set up a project, from installation to your
              first deploy.
            </HeadingDescription>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose>
            <HeadingLevel level={2}>
              {sections.map((section) => (
                <Fragment key={section.id}>
                  <Heading id={section.id}>{section.title}</Heading>
                  <p>{section.text}</p>
                </Fragment>
              ))}
            </HeadingLevel>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter>
        <ShellContent>
          <span className="ak-ink-70 text-sm">© 2026 Acme, Inc.</span>
        </ShellContent>
        <ShellEnd>
          <Link href="#">Back to top</Link>
        </ShellEnd>
      </ShellFooter>
    </Shell>
  );
}

const sections = [
  {
    id: "installation",
    title: "Installation",
    text: "Install the package with your package manager of choice, then import the components that you need. Everything else stays out of your bundle.",
  },
  {
    id: "configuration",
    title: "Configuration",
    text: "A single configuration file controls the build output and environment variables. Most projects only need to change one or two values.",
  },
  {
    id: "routing",
    title: "Routing",
    text: "Each file in the routes folder becomes a page. Dynamic segments use square brackets, and nested folders create nested paths.",
  },
  {
    id: "deployment",
    title: "Deployment",
    text: "Build once and deploy anywhere. The output is a static site that any host can serve, with no extra configuration.",
  },
];
