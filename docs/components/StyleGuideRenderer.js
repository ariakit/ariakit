import React from "react";
import PropTypes from "prop-types";
import { styled, Block, Code } from "../../src";
import Banner from "./Banner";
import Contents from "./Contents";
import "./globalStyles";

const Wrapper = styled(Block)`
  font-family: sans-serif;

  a {
    text-decoration: none;
    font-weight: 500;
    color: #1978c8;

    &:hover {
      text-decoration: underline !important;
    }
  }

  p > code:not(${Code}) {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 5px;
    font-family: "Fira Code", monospace;
    cursor: inherit;
  }

  [class*="rsg--pre"] {
    width: 100%;

    code {
      font-size: 16px;
      @media screen and (max-width: 640px) {
        font-size: 14px;
      }
    }

    &:not([class*="preview"]) {
      overflow: auto;
    }
  }
`;

const StyleGuideRenderer = ({ children }) => {
  const [intro, ...sections] = children.props.sections;
  const child = React.cloneElement(children, { ...children.props, sections });
  return (
    <Wrapper>
      <Banner intro={intro} />
      <Contents sections={sections}>{child}</Contents>
    </Wrapper>
  );
};

StyleGuideRenderer.propTypes = {
  children: PropTypes.node.isRequired
};

export default StyleGuideRenderer;
