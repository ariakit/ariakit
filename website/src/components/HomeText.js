import React from "react";
import { Paragraph } from "reas";

const Text = Paragraph.extend`
  font-family: Georgia, serif;
  font-size: 66px;
  @media (max-width: 1024px) {
    font-size: 50px;
  }
  @media (max-width: 768px) {
    font-size: 33px;
    text-align: center;
  }
`;

const HomeText = () => (
  <Text>Minimalist components for your next React app</Text>
);

export default HomeText;
