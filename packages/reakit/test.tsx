/* eslint-disable no-unused-expressions */
import * as React from "react";
import { styled, Box, as } from "./src";

interface Props {
  foo: string;
}

{
  const Test = styled(Box)<Props>``;
  const Test2 = as("div")(Test);
  const Test3 = styled(Box)<{ ds: boolean }>``;
  const Test4 = styled(Box)<{ aaa: boolean }>``;

  const Lol = Box.as(Test);
  const Lol2 = as(Test)(Box);
  const Lol3 = as([Test, Test3])(Box);
  const Lol4 = Box.as([Test, Test3]);
  const Lol5 = Lol4.as(Test4);

  <Lol />; // error
  <Lol as="div" foo="" />;
  <Lol as={["div"]} foo="" />;
  <Lol foo="" />;
  <Lol as={Test3} />; // error
  <Lol as={Test3} foo="" />; // error
  <Lol as={Test3} foo="" ds />;
  <Lol foo="" />;
  <Lol foo="" absolute />;

  <Lol2 />; // error
  <Lol2 as={Test3} />; // error
  <Lol2 as={Test3} foo="" ds />;
  <Lol2 foo="" />;
  <Lol2 foo="" absolute />;

  <Lol3 />; // error
  <Lol3 foo="" />; // error
  <Lol3 foo="" ds />;

  <Lol4 />; // error
  <Lol4 foo="" />; // error
  <Lol4 foo="" ds />;

  <Lol5 />; // error
  <Lol5 aaa />; // error
  <Lol5 foo="" />; // error
  <Lol5 foo="" ds />; // error
  <Lol5 foo="" ds aaa />;

  <Box />;
  <Box as />; // error
  <Box absolute />;
  <Box dsada />; // error
  <Box as="div" dsada />; // error
  <Test />; // error
  <Test2 />; // error
  <Box backgroundRepeat="repeat" fixed />;
  <Test foo="" />;
  <Test foo="" as />; // error
  <Test foo="" as={["div"]} />;
  <Test foo="" absolute />;
  <Test foo="" absolute="true" />; // error
  <Box as={Test} foo="" />;
  <Box as={Test2} />; // error
  <Box as={[Test2, Test3]} />; // error
  <Box as={[Test2, Test3]} foo="" />; // error
  <Box as={[Test2, Test3]} ds foo="" />;
}
