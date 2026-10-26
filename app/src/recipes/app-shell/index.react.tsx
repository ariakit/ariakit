import {
  Button,
  ButtonSlot,
} from "@ariakit/ui/components/button.ariakit.react";
import {
  Heading,
  HeadingLevel,
} from "@ariakit/ui/components/heading.ariakit.react";
import { Link } from "@ariakit/ui/components/link.ariakit.react";
import { Nav, NavLink } from "@ariakit/ui/components/nav.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellFooter,
  ShellFooterStart,
  ShellFooterEnd,
  ShellHeader,
  ShellHeaderStart,
  ShellHeaderEnd,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Hexagon, PanelLeft } from "lucide-react";
import { useId, useState } from "react";

export default function Example() {
  const [open, setOpen] = useState(true);
  const sidebarId = useId();
  return (
    <Shell>
      <ShellHeader $blur>
        <ShellHeaderStart>
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
        </ShellHeaderStart>
        <ShellHeaderEnd>
          <Button>Sign in</Button>
        </ShellHeaderEnd>
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
        <ShellMainIntro>
          <Prose>
            <Heading>Getting started</Heading>
            <p>
              Everything you need to set up a project, from installation to your
              first deploy.
            </p>
          </Prose>
        </ShellMainIntro>
        <ShellMainBody>
          <Prose>
            <HeadingLevel level={2}>
              {sections.map((section) => (
                <section key={section.id}>
                  <Heading id={section.id}>{section.title}</Heading>
                  <p>{section.text}</p>
                </section>
              ))}
            </HeadingLevel>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellFooter>
        <ShellFooterStart>
          <span className="ak-ink-70 text-sm">© 2026 Acme, Inc.</span>
        </ShellFooterStart>
        <ShellFooterEnd>
          <Link href="#">Back to top</Link>
        </ShellFooterEnd>
      </ShellFooter>
    </Shell>
  );
}

const sections = [
  {
    id: "installation",
    title: "Installation",
    text: "Install the package with your package manager of choice. The library ships ES modules and type declarations, so no extra setup is required for TypeScript projects.",
  },
  {
    id: "project-structure",
    title: "Project structure",
    text: "Pages live in the routes folder, shared components in the components folder, and styles next to the components that use them. Keep each folder small and focused.",
  },
  {
    id: "configuration",
    title: "Configuration",
    text: "A single configuration file controls the build output, environment variables, and integrations. Every option has a sensible default, so you can start with an empty file.",
  },
  {
    id: "routing",
    title: "Routing",
    text: "Each file in the routes folder becomes a page. Dynamic segments use square brackets, and nested folders create nested layouts that share their parent's shell.",
  },
  {
    id: "data-fetching",
    title: "Data fetching",
    text: "Load data on the server before the page renders, then stream the rest. Loaders run in parallel and cache their results per request.",
  },
  {
    id: "deployment",
    title: "Deployment",
    text: "Build once and deploy anywhere. The output is a static site plus an optional server entry that runs on any platform that supports standard web APIs.",
  },
];
