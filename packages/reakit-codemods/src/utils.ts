/* eslint-disable no-param-reassign */
import { ASTNode, JSCodeshift } from "./types";

export function addImportToReakit(
  importName: string,
  ast: ASTNode,
  j: JSCodeshift
) {
  ast.find(j.ImportDeclaration).forEach(importDeclarations => {
    if (importDeclarations) {
      importDeclarations.value.specifiers.push(
        j.importSpecifier(j.identifier(importName))
      );
    }
  });
}

export function renameJSXProperty(newPropertyName: string, element: ASTNode) {
  element.value.name = newPropertyName;
}
