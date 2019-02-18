declare module "rehype-react" {
  import * as React from "react";

  type Options = {
    createElement: typeof React.createElement;
    components: {
      [tagName: string]: React.ComponentType<any>;
    };
  };

  export default class RehypeReact {
    constructor(options: Options);

    Compiler: (node: any) => any;
  }
}
