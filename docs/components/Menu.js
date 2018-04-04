import React from "react";
import PropTypes from "prop-types";
import as, { Block } from "../../src";

const Wrapper = Block.extend`
  padding-right: 32px;
  padding: 0 32px 0 0;
  line-height: 150%;

  &,
  ul {
    list-style: none;
    text-align: right;
  }

  > li {
    margin-top: 24px;
    > ul {
      margin-top: 16px;
    }
    > a {
      text-transform: uppercase;
      color: #666;
    }
  }
`;

const Menu = ({ sections, ...props }) => (
  <Wrapper {...props}>
    {sections.map((section, i) => (
      <li key={i}>
        <a href={`#${section.slug}`}>{section.name}</a>
        <ul>
          {section.sections.concat(section.components).map((sec, j) => (
            <li key={j}>
              <a href={`#${sec.slug}`}>{sec.name}</a>
            </li>
          ))}
        </ul>
      </li>
    ))}
  </Wrapper>
);

Menu.propTypes = {
  sections: PropTypes.array.isRequired
};

export default as("ul")(Menu);
