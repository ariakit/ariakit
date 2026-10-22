import { Frame } from "@ariakit/ui/components/frame.ariakit.react";
import {
  Nav,
  NavDisclosure,
  NavGroup,
  NavGroupLabel,
  NavLinkLabel,
  NavList,
  NavSlot,
} from "@ariakit/ui/components/nav.ariakit.react";
import { ExampleRouter, RouterNavLink } from "../router.react.tsx";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const methodLayers = {
  GET: "success",
  POST: "brand",
  PATCH: "warning",
  DELETE: "danger",
} as const;

const guides = ["Introduction", "Authentication", "Errors", "Pagination"];

const resources: { name: string; endpoints: [Method, string][] }[] = [
  {
    name: "Customers",
    endpoints: [
      ["POST", "Create a customer"],
      ["GET", "List customers"],
      ["GET", "Retrieve a customer"],
      ["PATCH", "Update a customer"],
      ["DELETE", "Delete a customer"],
    ],
  },
  {
    name: "Invoices",
    endpoints: [
      ["POST", "Create an invoice"],
      ["GET", "List invoices"],
      ["POST", "Send an invoice"],
    ],
  },
  {
    name: "Payments",
    endpoints: [
      ["POST", "Create a payment"],
      ["GET", "Retrieve a payment"],
    ],
  },
];

function getPath(title: string) {
  return `/${title.toLowerCase().replaceAll(/\W+/g, "-")}`;
}

export default function Example() {
  return (
    <ExampleRouter initialPath={getPath("Retrieve a customer")}>
      <Frame
        $layer
        $lighten={0.5}
        $rounded="2xl"
        $border
        $p={2}
        className="w-80 text-sm"
      >
        <Nav aria-label="API reference" list={false} $cover>
          <NavList>
            {guides.map((id) => (
              <RouterNavLink key={id} to={getPath(id)}>
                {id}
              </RouterNavLink>
            ))}
          </NavList>
          <NavGroup $divider>
            <NavGroupLabel $uppercase>Resources</NavGroupLabel>
            <NavList>
              {resources.map((resource) => (
                <NavDisclosure
                  key={resource.name}
                  button={resource.name}
                  defaultOpen={resource.name === "Customers"}
                >
                  <NavList>
                    {resource.endpoints.map(([method, title]) => (
                      <RouterNavLink key={title} to={getPath(title)}>
                        <NavLinkLabel>{title}</NavLinkLabel>
                        <NavSlot
                          $kind="badge"
                          $layer={methodLayers[method]}
                          className="font-mono"
                        >
                          {method}
                        </NavSlot>
                      </RouterNavLink>
                    ))}
                  </NavList>
                </NavDisclosure>
              ))}
            </NavList>
          </NavGroup>
        </Nav>
      </Frame>
    </ExampleRouter>
  );
}
