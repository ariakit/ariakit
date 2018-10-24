/* eslint-disable no-param-reassign */
import { addImportToReakit, renameJSXProperty } from "../utils";
import {
  ImportDeclaration,
  CallExpression,
  ExpressionStatement,
  ASTNode,
  Identifier,
  ObjectExpression,
  Program,
  MemberExpression,
  ImportSpecifier
} from "../types";

// @ts-ignore
export default function transformer(file: any, api: { jscodeshift: any }) {
  const j = api.jscodeshift;

  const ast = j(file.source);

  let disguisedAs = "";
  let elementItself: Identifier;
  let asDeclarationHasArray = false;

  // remove call expression
  ast.find(j.CallExpression).forEach((element: CallExpression) => {
    if (
      element.value.callee.name === "as" &&
      element.parent &&
      element.parent.parent &&
      element.parent.parent.value.declaration
    ) {
      // eslint-disable-next-line
      elementItself = element.parent.parent.value.declaration.arguments[0];
      disguisedAs = element.value.arguments[0].value;
      element.parent.parent.value.declaration = j.identifier(
        elementItself.name
      );
      j(element).remove();
    } else if (
      element.value.callee.name === "as" &&
      element.value.arguments &&
      element.value.arguments[0].type === "ArrayExpression" &&
      element.parent &&
      element.parent.parent
    ) {
      asDeclarationHasArray = true;
      const componentUsed = element.parent.value.arguments[0];
      const callExpressionArguments = [componentUsed];
      element.value.arguments[0].elements.forEach(
        (componentArgument: Identifier) => {
          callExpressionArguments.push(componentArgument);
        }
      );
      element.value.callee = j.identifier("use");
      element.parent.parent.value.init = j.callExpression(
        element.value.callee,
        callExpressionArguments
      );

      addImportToReakit("use", ast, j);
    }
  });

  // remove import
  ast.find(j.ImportDeclaration).forEach((asIdentifier: ImportDeclaration) => {
    const specifiers = asIdentifier.value.specifiers.filter(
      (importedModule: ImportSpecifier) => importedModule.imported.name !== "as"
    );
    asIdentifier.value.specifiers = specifiers;
  });

  // property use to be added to the defaultProps
  const useProperty = j.property(
    "init",
    j.identifier("use"),
    j.literal(disguisedAs)
  );

  const memberExpression: ExpressionStatement = j.expressionStatement(
    j.assignmentExpression(
      "=",
      j.memberExpression(
        // @ts-ignore
        j.identifier(elementItself.name || "default"),
        j.identifier("defaultProps")
      ),
      j.objectExpression([useProperty])
    )
  );

  if (!asDeclarationHasArray) {
    const defaultProps = ast.find(j.Identifier, {
      name: "defaultProps"
    });

    if (defaultProps[0]) {
      defaultProps.forEach((element: Identifier) => {
        if (element.parent && element.parent.parent) {
          const properties: ObjectExpression =
            element.parent.parent.value.right;
          properties.properties.push(useProperty);
        }
      });
    } else {
      ast.find(j.Program).forEach((program: Program) => {
        const bodyLength: number = program.value.body.length;
        program.value.body.splice(bodyLength - 1, 0, memberExpression);
      });
    }
  }

  // deals with removing static Box.as from components;
  ast.find(j.MemberExpression).forEach((element: MemberExpression) => {
    if (
      element.value.property.name === "as" &&
      element.parent &&
      element.parent.parent
    ) {
      const disguisedAs2 = element.parent.value.arguments[0];
      const mainElement = element.value.object;
      element.parent.parent.value.init = j.callExpression(j.identifier("use"), [
        mainElement,
        disguisedAs2
      ]);

      addImportToReakit("use", ast, j);
    }
  });

  // work on jsx tags
  ast.find(j.JSXIdentifier, { name: "as" }).forEach((element: ASTNode) => {
    renameJSXProperty("use", element);
  });

  return ast.toSource();
}
