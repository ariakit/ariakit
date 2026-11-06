import { Button } from "@ariakit/ui/components/button.ariakit.react";
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
  ShellCenter,
  ShellContent,
  ShellEnd,
  ShellFooter,
  ShellHeader,
  ShellMain,
  ShellMainBody,
  ShellMainIntro,
  ShellSidebar,
  ShellSidebarBody,
  ShellStart,
} from "@ariakit/ui/components/shell.ariakit.react";
import { Hexagon } from "lucide-react";
import { Fragment } from "react";

export default function Example() {
  return (
    <Shell $maxWidth="80rem">
      <ShellHeader $blur>
        <ShellContent>
          <ShellStart>
            <a href="#" className="flex items-center gap-2 font-semibold">
              <Hexagon strokeWidth={1.5} className="size-5" />
              Acme Docs
            </a>
          </ShellStart>
          <ShellCenter $grow className="hidden @[40rem]/shell-header:flex">
            <InputGroup className="w-full">
              <Input
                aria-label="Search the docs"
                placeholder="Search the docs"
              />
            </InputGroup>
          </ShellCenter>
          <ShellEnd>
            <Button>Sign in</Button>
          </ShellEnd>
        </ShellContent>
      </ShellHeader>
      <Shell>
        <ShellSidebar landmark="nav" aria-label="Guides">
          <ShellSidebarBody>
            <Nav $cover>
              {sections.map((section) => (
                <NavLink key={section.id} href={`#${section.id}`}>
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
              <HeadingDescription>
                Everything you need to set up a project, from installation to
                your first deploy.
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
        <ShellSidebar
          landmark="aside"
          aria-label="On this page"
          $side="end"
          $show="5xl"
        >
          <ShellSidebarBody>
            <Nav $cover>
              {sections.map((section) => (
                <NavLink key={section.id} href={`#${section.id}`}>
                  {section.title}
                </NavLink>
              ))}
            </Nav>
          </ShellSidebarBody>
        </ShellSidebar>
      </Shell>
      <ShellFooter>
        <ShellContent>
          <ShellStart>
            <span className="ak-ink-70 text-sm">© 2026 Acme, Inc.</span>
          </ShellStart>
          <ShellEnd>
            <Link href="#">Back to top</Link>
          </ShellEnd>
        </ShellContent>
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
    id: "data",
    title: "Data",
    text: "Load data on the server and pass it to your pages as props. Requests run in parallel, and the results stay cached between navigations.",
  },
  {
    id: "deployment",
    title: "Deployment",
    text: "Build once and deploy anywhere. The output is a static site that any host can serve, with no extra configuration.",
  },
];
