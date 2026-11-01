import { Heading } from "@ariakit/ui/components/heading.ariakit.react";
import { Prose } from "@ariakit/ui/components/prose.ariakit.react";
import {
  Shell,
  ShellMain,
  ShellMainBody,
  ShellSidebar,
  ShellSidebarBody,
} from "@ariakit/ui/components/shell.ariakit.react";
import {
  Toc,
  TocItem,
  TocLink,
  TocList,
} from "@ariakit/ui/components/toc.ariakit.react";
import { Fragment } from "react";

const steps = [
  { slug: "create-the-project", title: "Create the project" },
  { slug: "add-the-database", title: "Add the database" },
  { slug: "connect-the-api", title: "Connect the API" },
  { slug: "add-sign-in", title: "Add sign-in" },
  { slug: "write-the-tests", title: "Write the tests" },
  { slug: "deploy-the-app", title: "Deploy the app" },
];

const text =
  "Finish this part before you move on, because the next part builds on it. The commands assume that you run them from the root of the project.";

const details =
  "When a command fails, read its output before you try again. Most errors name the file or the setting that you need to change.";

export default function Example() {
  return (
    <Shell>
      <ShellMain>
        <ShellMainBody>
          {/* The article text gets smaller in a narrow frame, so the sidebar
              keeps its room beside it. */}
          <Prose className="text-[length:clamp(0.625rem,2.5cqi,1rem)]">
            <Heading id="before-you-start" render={<h2 />}>
              <a href="#before-you-start">Before you start</a>
            </Heading>
            <p>{text}</p>
            <p>{details}</p>
            <Heading id="steps" render={<h2 />}>
              <a href="#steps">Steps</a>
            </Heading>
            <p>{text}</p>
            <p>{details}</p>
            {steps.map((step, index) => (
              <Fragment key={step.slug}>
                <Heading id={step.slug} render={<h3 />}>
                  <a href={`#${step.slug}`}>
                    {index + 1}. {step.title}
                  </a>
                </Heading>
                <p>{text}</p>
                <p>{details}</p>
              </Fragment>
            ))}
            <Heading id="next-steps" render={<h2 />}>
              <a href="#next-steps">Next steps</a>
            </Heading>
            <p>{text}</p>
            <p>{details}</p>
          </Prose>
        </ShellMainBody>
      </ShellMain>
      <ShellSidebar
        $side="end"
        $show
        $from="body"
        $border={false}
        $layer="transparent"
      >
        <ShellSidebarBody>
          <Toc label="Tutorial" $cover>
            <TocLink href="#before-you-start">Before you start</TocLink>
            <TocItem>
              <TocLink href="#steps">Steps</TocLink>
              {/* Only this list is ordered. The rows stay at the regular indent,
                  so the halo of a number cuts into the surface of the current
                  row. */}
              <TocList ordered>
                {steps.map((step) => (
                  <TocLink key={step.slug} href={`#${step.slug}`}>
                    {step.title}
                  </TocLink>
                ))}
              </TocList>
            </TocItem>
            <TocLink href="#next-steps">Next steps</TocLink>
          </Toc>
        </ShellSidebarBody>
      </ShellSidebar>
    </Shell>
  );
}
