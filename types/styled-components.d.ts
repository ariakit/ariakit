import * as React from 'react';
import { Component } from 'react';
import { StyledComponentClass } from 'styled-components';

declare module 'styled-components' {
  /*
    TODO can be deleted when https://github.com/styled-components/styled-components/pull/1827 gets released
  */
  export function isStyledComponent<Props>(
    target: Component | StyledComponentClass<Props, any>
  ): target is StyledComponentClass<Props, any>;
}
