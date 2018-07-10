import React from "react";
import { Container } from "reakit";
import filterSections from "../utils/filterSections";

const initialState = {
  sections: []
};

const filter = input => state => ({
  filtered: input ? filterSections(state.sections, input) : undefined
});

const MenuContainer = props => (
  <Container
    {...props}
    initialState={{ initialState, ...props.initialState }}
    actions={{ filter, ...props.actions }}
  />
);

export default MenuContainer;
