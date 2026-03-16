import { MemoryRouter, Outlet, Route, Routes } from "react-router";

import { Tab, TabList, TabPanel, Tabs } from "./tabs.tsx";

import "./style.css";

function GroceriesTabs() {
  return (
    <div className="wrapper">
      <Tabs>
        <TabList aria-label="Groceries">
          <Tab to="/">Fruits</Tab>
          <Tab to="/vegetables">Vegetables</Tab>
          <Tab to="/meat">Meat</Tab>
        </TabList>
        <div className="panels">
          <TabPanel>
            <Outlet />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

function Fruits() {
  return (
    <ul>
      <li>🍎 Apple</li>
      <li>🍇 Grape</li>
      <li>🍊 Orange</li>
    </ul>
  );
}

function Vegetables() {
  return (
    <ul>
      <li>🥕 Carrot</li>
      <li>🧅 Onion</li>
      <li>🥔 Potato</li>
    </ul>
  );
}

function Meat() {
  return (
    <ul>
      <li>🥩 Beef</li>
      <li>🍗 Chicken</li>
      <li>🥓 Pork</li>
    </ul>
  );
}

export default function Example() {
  return (
    // We're using MemoryRouter for demonstration purposes. But you can use
    // BrowserRouter, HashRouter, etc. depending on your needs.
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<GroceriesTabs />}>
          <Route index element={<Fruits />} />
          <Route path="/vegetables" element={<Vegetables />} />
          <Route path="/meat" element={<Meat />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
