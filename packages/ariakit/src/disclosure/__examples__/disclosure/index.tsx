import {
  Disclosure,
  DisclosureContent,
  useDisclosureState,
} from "ariakit/disclosure";
import "./style.css";

export default function Example() {
  const disclosure = useDisclosureState();
  return (
    <div className="wrapper">
      <Disclosure state={disclosure} className="button">
        What are Vegetables?
      </Disclosure>
      <DisclosureContent state={disclosure} className="content">
        <ul>
          <li>🍎 Apple</li>
          <li>🍇 Grape</li>
          <li>🍊 Orange</li>
        </ul>
      </DisclosureContent>
    </div>
  );
}
