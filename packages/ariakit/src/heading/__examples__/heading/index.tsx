import { useEffect, useRef } from "react";
import { select } from "ariakit-test";
import { Heading, HeadingLevel } from "ariakit/heading";
import "./style.css";

export default function Example() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = ref.current;
    if (!wrapper) return;
    select(wrapper, "CumTorquent");
  }, []);

  return (
    <div ref={ref} className="wrapper">
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
