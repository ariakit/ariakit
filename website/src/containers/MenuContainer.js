import React from "react";
import { Container } from "reakit";
import filterSections from "../utils/filterSections";

const initialState = {
  sections: [],
  filtered: []
};

const filter = input => state => ({
  filtered: filterSections(state.sections, input)
});

const MenuContainer = props => (
  <Container
    {...props}
    initialState={{ initialState, ...props.initialState }}
    actions={{ filter, ...props.actions }}
  />
);

export default MenuContainer;
