import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import {
  TabLink,
  TabLinkList,
  TabLinkPanel,
  useTabLinkStore,
} from "./tab-link.jsx";
import "./style.css";

function Tabs() {
  const tab = useTabLinkStore();
  const selectedId = tab.useState("selectedId");
  return (
    <div className="wrapper">
      <TabLinkList store={tab} className="tab-list" aria-label="Groceries">
        <TabLink className="tab" id="/fruits" to="/fruits">
          Fruits
        </TabLink>
        <TabLink className="tab" id="/vegetables" to="/vegetables">
          Vegetables
        </TabLink>
        <TabLink className="tab" id="/meat" to="/meat">
          Meat
        </TabLink>
      </TabLinkList>
      <div className="panels">
        <TabLinkPanel store={tab} tabId={selectedId}>
          <Outlet />
        </TabLinkPanel>
      </div>
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
    // We're using HashRouter here for demonstration purposes. You can change
    // it to HashRouter to see the effect (tip: You can select all instances of
    // HashRouter with Cmd/Ctrl+D).
    <HashRouter>
      <Routes>
        <Route path="/" element={<Tabs />}>
          <Route index element={<Navigate to="/fruits" />} />
          <Route path="/fruits" element={<Fruits />} />
          <Route path="/vegetables" element={<Vegetables />} />
          <Route path="/meat" element={<Meat />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
