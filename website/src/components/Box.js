import React from "react";
import PropTypes from "prop-types";
import { prop, withProp, ifProp } from "styled-tools";
import { Box as ReasBox, Block, Button, css, keyframes } from "../../../src";

const width = prop("dimensions.0");
const height = prop("dimensions.1");
const length = prop("dimensions.2");
const fontSize = withProp(width, w => w / 3);

const hoverIfAnimate = content =>
  ifProp(
    "animate",
    css`
      *:hover > & {
        ${content};
      }
    `
  );

const animation = keyframes`
  0% {
    transform: rotateY(0deg) rotateX(40deg);
  }
  100% {
    transform: rotateY(360deg) rotateX(40deg);
  }
`;

const Container = Block.extend`
  position: absolute;
  perspective-origin: 50% -50%;
  perspective: 2000px;
  width: ${width}px;
  height: ${height}px;
`;

const Wrapper = Block.extend`
  position: absolute;
  width: 100%;
  height: 100%;
  transition: 500ms transform ease-out;
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  ${ifProp(
    "animate",
    `animation: 10s linear infinite ${animation}`,
    "transform: rotateY(40deg) rotateX(40deg)"
  )};
`;

const Surface = ReasBox.extend`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  border-width: 0.02em;
  min-width: auto;
  padding: 0;
  font-size: ${fontSize}px;
  font-family: Georgia, serif;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #333;
  transition: 500ms transform ease-out, 300ms opacity ease-out;
  background-color: rgba(230, 230, 230, 0.6);
  box-shadow: none !important;
  cursor: default;
  transform-origin: 0 0;

  > * {
    font-family: sans-serif;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: initial;
    ${Button} {
      background-color: rgba(233, 233, 233, 0.9);
    }
  }
`;

const Large = Surface.extend`
  width: 100%;
  height: 100%;
`;

const Medium = Surface.extend`
  width: 100%;
  height: ${length}px;
`;

const Small = Surface.extend`
  width: ${length}px;
  height: 100%;
`;

const Front = Large.extend`
  transform: rotateY(0deg) translateZ(${length}px);
  opacity: 1;
  ${hoverIfAnimate("opacity: 0")};
`;

const contentZ = withProp(
  [length, "count", "i"],
  (l, count, i) => (i + 1) * l / (count + 1)
);

const contentAnimateZ = withProp([length, "i"], (l, i) => l + 100 * i + 20);

const pqp3 = withProp("i", i => 50 * i - 30);

const pqp4 = withProp("i", i => 20 * i - 5);

const pqp5 = withProp("i", i => 20 * i);

const Content = Large.extend`
  transform: translateZ(${contentZ}px);
  ${hoverIfAnimate(css`
    transform: rotateX(-${pqp5}deg) rotateZ(${pqp4}deg) translateX(${pqp3}px)
      translateY(${pqp3}px) translateZ(${contentAnimateZ}px);
    background-color: rgba(240, 240, 240, 0.9);
  `)};
`;

const Back = Large.extend``;

const Top = Medium.extend`
  transform: rotateX(90deg);
  top: 0;
  ${hoverIfAnimate("transform: rotateX(135deg)")};
`;

const Bottom = Medium.extend`
  transform: rotateX(90deg);
  top: ${height}px;
  ${hoverIfAnimate("transform: rotateX(45deg)")};
`;

const Right = Small.extend`
  transform: rotateY(-90deg);
  left: ${width}px;
  ${hoverIfAnimate("transform: rotateY(-45deg)")};
`;

const Left = Small.extend`
  transform: rotateY(-90deg);
  left: 0;
  ${hoverIfAnimate("transform: rotateY(-135deg)")};
`;

const Box = ({ dimensions, children, label, animate, ...props }) => {
  const childrenArray = React.Children.toArray(children);
  const surfaceProps = { dimensions, animate };
  return (
    <Container {...surfaceProps} {...props}>
      <Wrapper {...surfaceProps}>
        <Front {...surfaceProps}>{label}</Front>
        {childrenArray.map((child, i) => (
          <Content key={i} i={i} count={childrenArray.length} {...surfaceProps}>
            {child}
          </Content>
        ))}
        <Back {...surfaceProps} />
        <Left {...surfaceProps} />
        <Right {...surfaceProps} />
        <Top {...surfaceProps} />
        <Bottom {...surfaceProps} />
      </Wrapper>
    </Container>
  );
};

Box.propTypes = {
  dimensions: PropTypes.array,
  children: PropTypes.node,
  label: PropTypes.string,
  animate: PropTypes.bool
};

Box.defaultProps = {
  dimensions: [300, 200, 100]
};

export default Box;
