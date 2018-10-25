/* eslint-disable no-param-reassign */
export default function transformer(file, api) {
  const j = api.jscodeshift;

  const ast = j(file.source);

  let disguisedAs = "";
  let elementItself;
  let asDeclarationHasArray = false;

  // remove call expression
  ast.find(j.CallExpression).forEach(element => {
    if (
      element.value.callee.name === "as" &&
      element.parent &&
      element.value.arguments[0].type !== "ArrayExpression"
    ) {
      if (element.parent.parent.value.type === "VariableDeclarator") {
        // eslint-disable-next-line
        elementItself = element.parent.value.arguments[0];
        disguisedAs = element.value.arguments[0].value;
        element.parent.parent.value.init = j.callExpression(
          j.identifier("use"),
          [elementItself, j.identifier(disguisedAs)]
        );
        ast.find(j.ImportDeclaration).forEach(importDeclarations => {
          if (importDeclarations) {
            importDeclarations.value.specifiers.push(
              j.importSpecifier(j.identifier("use"))
            );
          }
        });
      }
    } else if (
      element.value.callee.name === "as" &&
      element.value.arguments &&
      element.value.arguments[0].type === "ArrayExpression"
    ) {
      asDeclarationHasArray = true;
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

      ast.find(j.ImportDeclaration).forEach(importDeclarations => {
        if (importDeclarations) {
          importDeclarations.value.specifiers.push(
            j.importSpecifier(j.identifier("use"))
          );
        }
      });
    }
  });

  // remove import
  ast.find(j.ImportDeclaration).forEach(asIdentifier => {
    const specifiers = asIdentifier.value.specifiers.filter(
      importedModule => importedModule.imported.name !== "as"
    );
    asIdentifier.value.specifiers = specifiers;
  });

  // property use to be added to the defaultProps
  const useProperty = j.property(
    "init",
    j.identifier("use"),
    j.literal(disguisedAs)
  );

  if (!asDeclarationHasArray) {
    const defaultProps = ast.find(j.Identifier, {
      name: "defaultProps"
    });

    if (defaultProps[0]) {
      defaultProps.forEach(element => {
        if (element.parent && element.parent.parent) {
          const properties = element.parent.parent.value.right;
          properties.properties.push(useProperty);
        }
      });
    }
  }

  // deals with removing static Box.as from components;
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
      }
      element.parent.parent.value.init = j.callExpression(
        j.identifier("use"),
        useArguments
      );

      ast.find(j.ImportDeclaration).forEach(importDeclarations => {
        if (importDeclarations) {
          importDeclarations.value.specifiers.push(
            j.importSpecifier(j.identifier("use"))
          );
        }
      });
    }
  });

  // work on jsx tags
  ast.find(j.JSXIdentifier, { name: "as" }).forEach(element => {
    element.value.name = "use";
  });

  return ast.toSource();
}
