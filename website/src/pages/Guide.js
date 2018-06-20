import React from "react";
import { styled } from "reakit";
import CoreLayout from "../layouts/CoreLayout";
import Menu from "../components/Menu";
import StyleguidistContainer from "../containers/StyleguidistContainer";

const Guide = () => (
  <CoreLayout>
    <StyleguidistContainer>
      {({ allSections }) =>
        console.log(allSections) || <Menu sections={allSections.find()} />
      }
    </StyleguidistContainer>
  </CoreLayout>
);

export default Guide;
