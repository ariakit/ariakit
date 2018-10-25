/* eslint-disable no-param-reassign */

export function addImportToReakit(importName, ast, j) {
  ast.find(j.ImportDeclaration).forEach(importDeclarations => {
    if (importDeclarations) {
      importDeclarations.value.specifiers.push(
        j.importSpecifier(j.identifier(importName))
      );
    }
  });
}

export function renameJSXProperty(newPropertyName, element) {
  element.value.name = newPropertyName;
}
