import { Heading, HeadingLevel } from "ariakit/heading";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <HeadingLevel>
        <Heading>Lacus Et Semper Turpis Massa Commodo Cum</Heading>
        <p>Torquent penatibus ipsum nascetur cursus primis lobortis</p>
        <HeadingLevel>
          <Heading>Ac Nullam</Heading>
          <p>Volutpat metus id purus dignissim fusce Tellus egestas.</p>
        </HeadingLevel>
        <HeadingLevel>
          <Heading>Quis Placerat</Heading>
          <p>Platea justo lectus. Praesent. Et sodales pellentesque</p>
        </HeadingLevel>
      </HeadingLevel>
    </div>
  );
}
