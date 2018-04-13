import React from "react";
import HomeBox from "./HomeBox";
import HomeLayout from "./HomeLayout";
import HomeButtons from "./HomeButtons";
import HomeText from "./HomeText";
import HomeCards from "./HomeCards";

const Home = () => (
  <HomeLayout
    bannerLeft={<HomeBox />}
    bannerRight={<HomeText />}
    middle={<HomeButtons />}
    cards={<HomeCards />}
  />
);

export default Home;
