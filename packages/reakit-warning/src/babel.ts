import { Visitor, types } from "@babel/core";

type PluginParameter = {
  types: typeof types;
};

type PluginReturn = {
  visitor: Visitor;
};

export default function babelPlugin({
  types: t
}: PluginParameter): PluginReturn {
  const seen = Symbol("seen");

  const binaryExpression = t.binaryExpression(
    "!==",
    t.memberExpression(
      t.memberExpression(t.identifier("process"), t.identifier("env"), false),
      t.identifier("NODE_ENV"),
      false
    ),
    t.stringLiteral("production")
  );

  return {
    visitor: {
      CallExpression(path) {
        const node = path.node as types.CallExpression & { [seen]: boolean };

        // Ignore if it's already been processed
        if (node[seen]) {
          return;
        }

        const callee = path.get("callee");
        const isWarning = callee.isIdentifier({ name: "warning" });
        const isUseWarning = callee.isIdentifier({ name: "useWarning" });

        if (isWarning || isUseWarning) {
          // Turns this code:
          // warning(argument);
          // into this:
          // typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production" ? warning(argument) : void 0;
          node[seen] = true;
          path.replaceWith(
            t.ifStatement(
              binaryExpression,
              t.blockStatement([t.expressionStatement(node)])
            )
          );
        }
      }
    }
  };
}

module.exports = babelPlugin;
