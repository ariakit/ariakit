import { Outlet, Route, Routes } from "react-router-dom";
import {
  TabLink,
  TabLinkList,
  TabLinkPanel,
  useTabLinkState,
} from "./tab-link";
import "./style.css";

function Tabs() {
  const tab = useTabLinkState();
  return (
    <div className="wrapper">
      <TabLinkList state={tab} className="tab-list" aria-label="Groceries">
        <TabLink className="tab" id="/" to="/">
          Fruits
        </TabLink>
        <TabLink className="tab" id="/vegetables" to="/vegetables">
          Vegetables
        </TabLink>
        <TabLink className="tab" id="/meat" to="/meat">
          Meat
        </TabLink>
      </TabLinkList>
      <TabLinkPanel state={tab} tabId={tab.selectedId || undefined}>
        <Outlet />
      </TabLinkPanel>
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
  const fruits = <Fruits />;
  return (
    <Routes>
      <Route path="/" element={<Tabs />}>
        <Route index element={fruits} />
        <Route path="/vegetables" element={<Vegetables />} />
        <Route path="/meat" element={<Meat />} />
      </Route>
    </Routes>
  );
}
