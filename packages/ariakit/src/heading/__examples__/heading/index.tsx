import { Heading, HeadingLevel } from "ariakit/heading";
import "./style.css";

export default function Example() {
  return (
    <div className="wrapper">
      <HeadingLevel>
        <Heading>Heading 1</Heading>
        <p>Torquent penatibus ipsum nascetur cursus primis lobortis</p>
        <HeadingLevel>
          <Heading>Heading 2</Heading>
          <p>Volutpat metus id purus dignissim fusce Tellus egestas.</p>
        </HeadingLevel>
        <HeadingLevel>
          <Heading>Heading 2</Heading>
          <p>Platea justo lectus. Praesent. Et sodales pellentesque</p>
        </HeadingLevel>
      </HeadingLevel>
    </div>
  );
}
