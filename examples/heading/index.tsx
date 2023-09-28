import "./style.css";
import { Heading, HeadingLevel } from "@ariakit/react";

export default function Example() {
  return (
    <div className="wrapper">
      <HeadingLevel>
        <Heading className="heading">Heading 1</Heading>
        <p>Torquent penatibus ipsum nascetur cursus primis lobortis</p>
        <HeadingLevel>
          <Heading className="heading">Heading 2</Heading>
          <p>Volutpat metus id purus dignissim fusce Tellus egestas.</p>
        </HeadingLevel>
        <HeadingLevel>
          <Heading className="heading">Heading 2</Heading>
          <p>Platea justo lectus. Praesent. Et sodales pellentesque</p>
        </HeadingLevel>
      </HeadingLevel>
    </div>
  );
}
