import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <Ariakit.TabProvider>
        <Ariakit.TabList className="tab-list" aria-label="Page">
          <Ariakit.Tab className="tab">Documentation</Ariakit.Tab>
          <Ariakit.Tab className="tab">Reference</Ariakit.Tab>
        </Ariakit.TabList>
        <div className="panels">
          <Ariakit.TabPanel>
            <Ariakit.TabProvider>
              <Ariakit.TabList className="tab-list" aria-label="Get started">
                <Ariakit.Tab className="tab">npm</Ariakit.Tab>
                <Ariakit.Tab className="tab">yarn</Ariakit.Tab>
                <Ariakit.Tab className="tab">pnpm</Ariakit.Tab>
              </Ariakit.TabList>
              <Ariakit.TabPanel unmountOnHide>
                <pre>
                  <code>{`npm install @ariakit/react`}</code>
                </pre>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide>
                <pre>
                  <code>{`yarn add @ariakit/react`}</code>
                </pre>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide>
                <pre>
                  <code>{`pnpm add @ariakit/react`}</code>
                </pre>
              </Ariakit.TabPanel>
            </Ariakit.TabProvider>
          </Ariakit.TabPanel>
          <Ariakit.TabPanel>
            <Ariakit.TabProvider>
              <Ariakit.TabList className="tab-list" aria-label="Code example">
                <Ariakit.Tab className="tab">index.js</Ariakit.Tab>
                <Ariakit.Tab className="tab">index.css</Ariakit.Tab>
              </Ariakit.TabList>
              <Ariakit.TabPanel unmountOnHide>
                <pre>
                  <code>{`import * as Ariakit from "@ariakit/react";`}</code>
                </pre>
              </Ariakit.TabPanel>
              <Ariakit.TabPanel unmountOnHide>
                <pre>
                  <code>{`.button { color: red }`}</code>
                </pre>
              </Ariakit.TabPanel>
            </Ariakit.TabProvider>
          </Ariakit.TabPanel>
        </div>
      </Ariakit.TabProvider>
    </div>
  );
}
