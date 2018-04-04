import React from "react";
import PropTypes from "prop-types";
import { Block } from "../../src";
import Banner from "./Banner";
import Contents from "./Contents";
import "./globalStyles";

const Wrapper = Block.extend`
  font-family: sans-serif;

  a {
    text-decoration: none;
    font-weight: 500;
    color: #1978c8;

    &:hover {
      text-decoration: underline !important;
    }
  }

  code {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 2px 5px;
    font-family: "Fira Code", monospace;
    cursor: inherit;
  }

  [class*="rsg--pre-"] {
    width: 100%;
    overflow: auto;

    code {
      padding: 0;
      background: none;
      font-size: 16px;
      @media screen and (max-width: 640px) {
        font-size: 14px;
      }
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
