import React from "react";
import { styled, Image } from "reakit";
import { Helmet } from "react-helmet";
import CoreLayout from "../layouts/CoreLayout";
import ContentWrapper from "../elements/ContentWrapper";
import svg404 from "../images/404.svg";

const StyledWrapper = styled(ContentWrapper)`
  justify-content: center;
  margin: 100px 0 0;
`;

const NotFound = () => (
  <CoreLayout>
    <Helmet>
      <title>Not Found - ReaKit</title>
    </Helmet>
    <StyledWrapper>
      <Image src={svg404} alt="404" />
    </StyledWrapper>
  </CoreLayout>
);

export default NotFound;
