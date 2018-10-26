/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

const { renameJSXProperty, replaceAsWithUse } = require("../utils");

export default function transformer(file, api) {
  const j = api.jscodeshift;

  const ast = j(file.source);

  let elementItself;

  /**
   * Works on a call expression, in this case as call.
   * Changes as("div")(Button) to use(Button, "div")
   * and also changes as([Link, "div"])(Button) to use(Button, Link, "div")
   */
  ast.find(j.CallExpression).forEach(element => {
    // handles first case where we don't have a
    if (
      element.value.callee.name === "as" &&
      element.parent &&
      element.value.arguments[0].type !== "ArrayExpression" &&
      element.parent.parent.value.type === "VariableDeclarator"
    ) {
      elementItself = element.parent.value.arguments[0];
      /**
       * case where we have as("div")(Button)
       * where div is considered a literal.
       */
      if (element.value.arguments[0].type === "Literal") {
        element.parent.parent.value.init = j.callExpression(
          j.identifier("use"),
          [elementItself, j.literal(element.value.arguments[0].value)]
        );
      } else if (element.value.arguments[0].type === "Identifier") {
        /**
         * Case where we have as(OtherElement)(Button)
         */
        element.parent.parent.value.init = j.callExpression(
          j.identifier("use"),
          [elementItself, element.value.arguments[0]]
        );
      }
    } else if (
      element.value.callee.name === "as" &&
      element.value.arguments &&
      element.value.arguments[0].type === "ArrayExpression"
    ) {
      const componentUsed = element.parent.value.arguments[0];
      const callExpressionArguments = [componentUsed];
      element.value.arguments[0].elements.forEach(componentArgument => {
        callExpressionArguments.push(componentArgument);
      });
      element.value.callee = j.identifier("use");
      element.parent.parent.value.init = j.callExpression(
        element.value.callee,
        callExpressionArguments
      );
    }

    replaceAsWithUse(j, ast);
  });

  /**
   * Convert Box.as(something) to use(Box, something)
   */
  ast.find(j.MemberExpression).forEach(element => {
    if (
      element.value.property.name === "as" &&
      element.parent &&
      element.parent.parent
    ) {
      const disguisedAs2 = element.parent.value.arguments[0];
      const mainElement = element.value.object;
      const useArguments = [mainElement];
      if (disguisedAs2.type === "ArrayExpression") {
        disguisedAs2.elements.forEach(arg => useArguments.push(arg));
      } else {
        useArguments.push(disguisedAs2);
      }
      element.parent.parent.value.init = j.callExpression(
        j.identifier("use"),
        useArguments
      );
    }
    replaceAsWithUse(j, ast);
  });

  /**
   * Rename as from JSX Tags from as to use
   */
  renameJSXProperty("as", "use", ast, j);
  renameJSXProperty("areas", "templateAreas", ast, j);
  renameJSXProperty("columns", "templateColumns", ast, j);
  renameJSXProperty("rows", "templateRows", ast, j);

  return ast.toSource();
}
