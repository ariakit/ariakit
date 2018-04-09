import React from "react";
import LogoBox from "./LogoBox";
import { Paragraph } from "../../../src";

const Home = props => (
  <div>
    <Paragraph
      fontFamily="Georgia"
      absolute
      fontSize={66}
      width={800}
      top={220}
      left={530}
    >
      Minimalist building blocks for your next React app
    </Paragraph>
    <LogoBox />
  </div>
);

export default Home;
