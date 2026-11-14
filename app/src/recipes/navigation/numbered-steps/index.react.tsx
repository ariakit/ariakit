import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavItem,
  NavList,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

interface Step {
  title: string;
  parts?: string[];
}

const steps: Step[] = [
  { title: "Create the project" },
  { title: "Add the database", parts: ["Choose a provider", "Run the setup"] },
  { title: "Connect the API" },
  { title: "Add sign-in" },
  { title: "Deploy the app" },
];

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(" ", "-")}`;
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Connect the API")}>
      <Frame $lighten={0.5} $rounded="2xl" $border $p={2} className="w-72">
        {/* The ordered navigation numbers the steps, and the guide joins the
            numbers and bends into the parts of a step. */}
        <Nav aria-label="Setup guide" ordered $guide="smooth" $cover>
          {steps.map((step) => {
            const link = (
              <RouterNavLink key={step.title} to={getPath(step.title)}>
                {step.title}
              </RouterNavLink>
            );
            if (!step.parts) return link;
            return (
              <NavItem key={step.title}>
                {link}
                <NavList>
                  {step.parts.map((part) => (
                    <RouterNavLink key={part} to={getPath(part)}>
                      {part}
                    </RouterNavLink>
                  ))}
                </NavList>
              </NavItem>
            );
          })}
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
