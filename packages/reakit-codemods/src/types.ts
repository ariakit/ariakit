export interface ASTNode extends Object {
  id?: {
    name: string;
  };
  arguments?: ASTNode[];
  body?: ASTNode[];
  elements?: ASTNode[];
  expression?: {
    left: {
      computed: boolean;
      object: ASTNode;
      property: ASTNode;
      type: string;
    };
    operator: string;
    right: ASTNode;
    type: string;
  };
  filter?: (p: (p: ASTNode) => boolean) => ASTNode;
  find: (objectExpression: any, filterExpression?: object) => ASTNode;
  forEach: (p: (p: ASTNode) => void) => ASTNode;
  get?: (property: string) => ASTNode;
  remove?: (_?: void) => void;
  nodes?: (_?: void) => ASTNode[];
  pop?: (_?: void) => ASTNode;
  key?: {
    name: string;
    value: ASTNode | string;
  };
  node?: ASTNode;
  name?: string;
  object?: object;
  parent?: ASTNode;
  properties?: ASTNode[];
  property?: ASTNode;
  prune?: Function;
  replaceWith?: (objectExpression: object) => ASTNode;
  size?: (_?: void) => number;
  type?: string;
  value?: ASTNode | string | any;
  toSource?: (
    object: {
      quote?: string;
    }
  ) => string;
  source?: any;
  ast?: ASTNode;
  rules?: ModuleRule[];
  __paths?: ASTNode[];
}

interface ModuleRule {
  loader?: string;
}

export type SourceType = "script" | "module" | "unambiguous";

export type Node = ASTNode & { [key: string]: any };
export type Expression = Node;
export type Statement = Node;
export type Pattern =
  | Identifier
  | ObjectPattern
  | ArrayPattern
  | RestElement
  | AssignmentPattern;
export type Declaration =
  | VariableDeclaration
  | ClassDeclaration
  | FunctionDeclaration;

export type DeclarationBase = ASTNode & {
  declare?: true;
};

export type HasDecorators = ASTNode & {
  decorators?: Array<Decorator>;
};

export type InterpreterDirective = ASTNode & {
  type: "InterpreterDirective";
  value: string;
};

export type Identifier = PatternBase & {
  type: "Identifier";
  name: string;

  __clone(): Identifier;
};

export type PrivateName = ASTNode & {
  type: "PrivateName";
  id: Identifier;
};

// Literals

export type Literal =
  | RegExpLiteral
  | NullLiteral
  | StringLiteral
  | BooleanLiteral
  | NumericLiteral;

export type RegExpLiteral = ASTNode & {
  type: "RegExpLiteral";
  pattern: string;
};

export type NullLiteral = ASTNode & {
  type: "NullLiteral";
};

export type StringLiteral = ASTNode & {
  type: "StringLiteral";
  value: string;
};

export type BooleanLiteral = ASTNode & {
  type: "BooleanLiteral";
  value: boolean;
};

export type NumericLiteral = ASTNode & {
  type: "NumericLiteral";
  value: number;
};

export type BigIntLiteral = ASTNode & {
  type: "BigIntLiteral";
  value: number;
};

// Programs

export type BlockStatementLike = Program | BlockStatement;

export type File = ASTNode & {
  type: "File";
  program: Program;
  comments: Array<Comment>;
  tokens: Array<any>;
};

export type Program = ASTNode & {
  type: "Program";
  sourceType: SourceType;
  body: Array<Statement | ModuleDeclaration>; // TODO: Array
  directives: Array<Directive>; // TODO: Not in spec
  interpreter: InterpreterDirective | null;
};

// Functions

export type Function =
  | NormalFunction
  | ArrowFunctionExpression
  | ObjectMethod
  | ClassMethod;

export type NormalFunction = FunctionDeclaration | FunctionExpression;

export type BodilessFunctionOrMethodBase = HasDecorators & {
  id?: Identifier;
  params: Array<Pattern>;
  body: BlockStatement;
  generator: boolean;
  async: boolean;
};

export type BodilessFunctionBase = BodilessFunctionOrMethodBase & {
  id?: Identifier;
};

export type FunctionBase = BodilessFunctionBase & {
  body: BlockStatement;
};

// Statements

export type ExpressionStatement = ASTNode & {
  type: "ExpressionStatement";
  expression: Expression;
};

export type BlockStatement = ASTNode & {
  type: "BlockStatement";
  body: Array<Statement>; // TODO: Array
  directives: Array<Directive>;
};

export type EmptyStatement = ASTNode & {
  type: "EmptyStatement";
};

export type DebuggerStatement = ASTNode & {
  type: "DebuggerStatement";
};

export type WithStatement = ASTNode & {
  type: "WithStatement";
  object: Expression;
  body: Statement;
};

export type ReturnStatement = ASTNode & {
  type: "ReturnStatement";
  argument?: Expression;
};

export type LabeledStatement = ASTNode & {
  type: "LabeledStatement";
  label: Identifier;
  body: Statement;
};

export type BreakStatement = ASTNode & {
  type: "BreakStatement";
  label?: Identifier;
};

export type ContinueStatement = ASTNode & {
  type: "ContinueStatement";
  label?: Identifier;
};

// Choice

export type IfStatement = ASTNode & {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate?: Statement;
};

export type SwitchStatement = ASTNode & {
  type: "SwitchStatement";
  discriminant: Expression;
  cases: Array<SwitchCase>;
};

export type SwitchCase = ASTNode & {
  type: "SwitchCase";
  test?: Expression;
  consequent: Array<Statement>;
};

// Exceptions

export type ThrowStatement = ASTNode & {
  type: "ThrowStatement";
  argument: Expression;
};

export type TryStatement = ASTNode & {
  type: "TryStatement";
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
};

export type CatchClause = ASTNode & {
  type: "CatchClause";
  param: Pattern;
  body: BlockStatement;
};

// Loops

export type WhileStatement = ASTNode & {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
};

export type DoWhileStatement = ASTNode & {
  type: "DoWhileStatement";
  body: Statement;
  test: Expression;
};

export type ForLike = ForStatement | ForInOf;

export type ForStatement = ASTNode & {
  type: "ForStatement";
  init?: VariableDeclaration | Expression;
  test?: Expression;
  update?: Expression;
  body: Statement;
};

export type ForInOf = ForInStatement | ForOfStatement;

export type ForInOfBase = ASTNode & {
  type: "ForInStatement";
  left: VariableDeclaration | Expression;
  right: Expression;
  body: Statement;
};

export type ForInStatement = ForInOfBase & {
  type: "ForInStatement";
  // TODO: Shouldn't be here, but have to declare it because it's assigned to a ForInOf unconditionally.
  await: boolean;
};

export type ForOfStatement = ForInOfBase & {
  type: "ForOfStatement";
  await: boolean;
};

// Declarations

export type OptFunctionDeclaration = FunctionBase &
  DeclarationBase & {
    type: "FunctionDeclaration";
  };

export type FunctionDeclaration = OptFunctionDeclaration & {
  id: Identifier;
};

export type VariableDeclaration = DeclarationBase &
  HasDecorators & {
    type: "VariableDeclaration";
    declarations: Array<VariableDeclarator>;
    kind: "var" | "let" | "const";
  };

export type VariableDeclarator = ASTNode & {
  type: "VariableDeclarator";
  id: Pattern;
  init?: Expression;
};

// Misc

export type Decorator = ASTNode & {
  type: "Decorator";
  expression: Expression;
  arguments?: Array<Expression | SpreadElement>;
};

export type Directive = ASTNode & {
  type: "Directive";
  value: DirectiveLiteral;
};

export type DirectiveLiteral = StringLiteral & { type: "DirectiveLiteral" };

// Expressions

export type Super = ASTNode & { type: "Super" };

export type Import = ASTNode & { type: "Import" };

export type ThisExpression = ASTNode & { type: "ThisExpression" };

export type ArrowFunctionExpression = FunctionBase & {
  type: "ArrowFunctionExpression";
  body: BlockStatement | Expression;
};

export type YieldExpression = ASTNode & {
  type: "YieldExpression";
  argument?: Expression;
  delegate: boolean;
};

export type AwaitExpression = ASTNode & {
  type: "AwaitExpression";
  argument?: Expression;
};

export type ArrayExpression = ASTNode & {
  type: "ArrayExpression";
  elements?: Array<Expression | SpreadElement>;
};

export type ObjectExpression = ASTNode & {
  type: "ObjectExpression";
  properties: Array<ObjectProperty | ObjectMethod | SpreadElement>;
};

export type ObjectOrClassMember = ClassMethod | ClassProperty | ObjectMember;

export type ObjectMember = ObjectProperty | ObjectMethod;

export type ObjectMemberBase = ASTNode & {
  key: Expression;
  computed: boolean;
  value: Expression;
  decorators: Array<Decorator>;
  kind?: "get" | "set" | "method";
};

export type ObjectProperty = ObjectMemberBase & {
  type: "ObjectProperty";
  shorthand: boolean;
};

export type ObjectMethod = ObjectMemberBase &
  MethodBase & {
    type: "ObjectMethod";
    kind: "get" | "set" | "method"; // Never "constructor"
  };

export type FunctionExpression = MethodBase & {
  kind?: void; // never set
  type: "FunctionExpression";
};

// Unary operations

export type UnaryExpression = ASTNode & {
  type: "UnaryExpression";
  operator: UnaryOperator;
  prefix: boolean;
  argument: Expression;
};

export type UnaryOperator =
  | "-"
  | "+"
  | "!"
  | "~"
  | "typeof"
  | "void"
  | "delete"
  | "throw";

export type UpdateExpression = ASTNode & {
  type: "UpdateExpression";
  operator: UpdateOperator;
  argument: Expression;
  prefix: boolean;
};

export type UpdateOperator = "++" | "--";

// Binary operations

export type BinaryExpression = ASTNode & {
  type: "BinaryExpression";
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
};

export type BinaryOperator =
  | "=="
  | "!="
  | "==="
  | "!=="
  | "<"
  | "<="
  | ">"
  | ">="
  | "<<"
  | ">>"
  | ">>>"
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "|"
  | "^"
  | "&"
  | "in"
  | "instanceof";

export type AssignmentExpression = ASTNode & {
  type: "AssignmentExpression";
  operator: AssignmentOperator;
  left: Pattern | Expression;
  right: Expression;
};

export type AssignmentOperator =
  | "="
  | "+="
  | "-="
  | "*="
  | "/="
  | "%="
  | "<<="
  | ">>="
  | ">>>="
  | "|="
  | "^="
  | "&=";

export type LogicalExpression = ASTNode & {
  type: "LogicalExpression";
  operator: LogicalOperator;
  left: Expression;
  right: Expression;
};

export type LogicalOperator = "||" | "&&";

export type SpreadElement = ASTNode & {
  type: "SpreadElement";
  argument: Expression;
};

export type MemberExpression = ASTNode & {
  type: "MemberExpression";
  object: Expression | Super;
  property: Expression;
  computed: boolean;
};

export type OptionalMemberExpression = ASTNode & {
  type: "OptionalMemberExpression";
  object: Expression | Super;
  property: Expression;
  computed: boolean;
  optional: boolean;
};

export type OptionalCallExpression = CallOrNewBase & {
  type: "OptionalCallExpression";
  optional: boolean;
};
export type BindExpression = ASTNode & {
  type: "BindExpression";
  object?: Array<Expression>;
  callee: Array<Expression>;
};

export type ConditionalExpression = ASTNode & {
  type: "ConditionalExpression";
  test: Expression;
  alternate: Expression;
  consequent: Expression;
};

export type CallOrNewBase = ASTNode & {
  callee: Expression | Super | Import;
  arguments: Array<Expression | SpreadElement>; // TODO: Array
};

export type CallExpression = CallOrNewBase & {
  type: "CallExpression";
};

export type NewExpression = CallOrNewBase & {
  type: "NewExpression";
  optional?: boolean; // TODO: Not in spec
};

export type SequenceExpression = ASTNode & {
  type: "SequenceExpression";
  expressions: Array<Expression>;
};

// Template Literals

export type TemplateLiteral = ASTNode & {
  type: "TemplateLiteral";
  quasis: Array<TemplateElement>;
  expressions: Array<Expression>;
};

export type TaggedTemplateExpression = ASTNode & {
  type: "TaggedTemplateExpression";
  tag: Expression;
  quasi: TemplateLiteral;
};

export type TemplateElement = ASTNode & {
  type: "TemplateElement";
  tail: boolean;
  value: {
    cooked: string;
    raw: string;
  };
};

// Patterns

// TypeScript access modifiers
export type Accessibility = "public" | "protected" | "private";

export type PatternBase = HasDecorators;

export type AssignmentProperty = ObjectProperty & {
  value: Pattern;
};

export type ObjectPattern = PatternBase & {
  type: "ObjectPattern";
  properties: Array<AssignmentProperty | RestElement>;
};

export type ArrayPattern = PatternBase & {
  type: "ArrayPattern";
  elements?: Array<Pattern>;
};

export type RestElement = PatternBase & {
  type: "RestElement";
  argument: Pattern;
};

export type AssignmentPattern = PatternBase & {
  type: "AssignmentPattern";
  left: Pattern;
  right: Expression;
};

// Classes

export type Class = ClassDeclaration | ClassExpression;

export type ClassBase = HasDecorators & {
  id: Identifier;
  superClass: Expression;
  body: ClassBody;
  decorators: Array<Decorator>;
};

export type ClassBody = ASTNode & {
  type: "ClassBody";
  body: Array<ClassMember>;
};

export type ClassMemberBase = ASTNode &
  HasDecorators & {
    static: boolean;
    computed: boolean;
  };

export type ClassMember =
  | ClassMethod
  | ClassPrivateMethod
  | ClassProperty
  | ClassPrivateProperty;

export type MethodLike =
  | ObjectMethod
  | FunctionExpression
  | ClassMethod
  | ClassPrivateMethod;

export type MethodBase = FunctionBase & {
  kind: any;
};

export type MethodKind = "constructor" | "method" | "get" | "set";

export type ClassMethodOrDeclareMethodCommon = ClassMemberBase & {
  key: Expression;
  kind: MethodKind;
  static: boolean;
  decorators: Array<Decorator>;
};

export type ClassMethod = MethodBase &
  ClassMethodOrDeclareMethodCommon & {
    type: "ClassMethod";
  };

export type ClassPrivateMethod = ASTNode &
  ClassMethodOrDeclareMethodCommon &
  MethodBase & {
    type: "ClassPrivateMethod";
    key: PrivateName;
    computed: boolean;
  };

export type ClassProperty = ClassMemberBase & {
  type: "ClassProperty";
  key: Expression;
  value: Expression;
};

export type ClassPrivateProperty = ASTNode & {
  type: "ClassPrivateProperty";
  key: PrivateName;
  value: Expression;
  static: boolean;
  computed: boolean;
};

export type OptClassDeclaration = ClassBase &
  DeclarationBase &
  HasDecorators & {
    type: "ClassDeclaration";
  };

export type ClassDeclaration = OptClassDeclaration & {
  id: Identifier;
};

export type ClassExpression = ClassBase & { type: "ClassExpression" };

export type MetaProperty = ASTNode & {
  type: "MetaProperty";
  meta: Identifier;
  property: Identifier;
};

// Modules

export type ModuleDeclaration = AnyImport | AnyExport;

export type AnyImport = ImportDeclaration;

export type AnyExport =
  | ExportNamedDeclaration
  | ExportDefaultDeclaration
  | ExportAllDeclaration;

export type ModuleSpecifier = ASTNode & {
  local: Identifier;
};

// Imports

export type ImportDeclaration = ASTNode & {
  type: "ImportDeclaration";
  // TODO: Array
  specifiers: Array<
    ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
  >;
  source: Literal;

  importKind?: "type" | "typeof" | "value"; // TODO: Not in spec
};

export type ImportSpecifier = ModuleSpecifier & {
  type: "ImportSpecifier";
  imported: Identifier;
};

export type ImportDefaultSpecifier = ModuleSpecifier & {
  type: "ImportDefaultSpecifier";
};

export type ImportNamespaceSpecifier = ModuleSpecifier & {
  type: "ImportNamespaceSpecifier";
};

// Exports

export type ExportNamedDeclaration = ASTNode & {
  type: "ExportNamedDeclaration";
  declaration?: Declaration;
  specifiers: Array<ExportSpecifier>;
  source?: Literal;

  exportKind?: "type" | "value"; // TODO: Not in spec
};

export type ExportSpecifier = ASTNode & {
  type: "ExportSpecifier";
  exported: Identifier;
};

export type ExportDefaultDeclaration = ASTNode & {
  type: "ExportDefaultDeclaration";
  declaration: OptFunctionDeclaration | OptClassDeclaration | Expression;
};

export type ExportAllDeclaration = ASTNode & {
  type: "ExportAllDeclaration";
  source: Literal;
  exportKind?: "type" | "value"; // TODO: Not in spec
};

// JSX (TODO: Not in spec)

export type JSXIdentifier = Node;
export type JSXNamespacedName = Node;
export type JSXMemberExpression = Node;
export type JSXEmptyExpression = Node;
export type JSXSpreadChild = Node;
export type JSXExpressionContainer = Node;
export type JSXAttribute = Node;
export type JSXOpeningElement = ASTNode & {
  type: "JSXOpeningElement";
  name: JSXNamespacedName | JSXMemberExpression;
  attributes: Array<JSXAttribute>;
  selfClosing: boolean;
};
export type JSXClosingElement = Node;
export type JSXElement = Node;
export type JSXOpeningFragment = Node;
export type JSXClosingFragment = Node;
export type JSXFragment = Node;

interface ExpressionObject {
  name?: string;
}

export interface JSCodeshift extends Object {
  (source?: ASTNode | string): ASTNode;
  withParser: (parser: string) => JSCodeshift;
  identifier: (key: string) => ASTNode;
  literal: (key: valueType) => ASTNode;
  memberExpression: (node1: ASTNode, node2: ASTNode, bool?: boolean) => ASTNode;
  objectProperty: (key: ASTNode, property: valueType) => ASTNode;
  objectExpression: (properties: ASTNode[]) => ASTNode;
  newExpression: (expression: ASTNode, args: ASTNode[]) => ASTNode;
  callExpression: (expression: ASTNode, args: ASTNode[]) => ASTNode;
  variableDeclarator: (key: ASTNode, args: ASTNode) => ASTNode;
  variableDeclaration: (key: string, args: ASTNode[]) => ASTNode;
  arrayExpression: (args?: ASTNode[]) => ASTNode;
  property: (type: string, key: ASTNode, value: ASTNode) => ASTNode;
  program: (nodes: ASTNode[]) => ASTNode;
  booleanLiteral: (bool: boolean) => ASTNode;
  arrowFunctionExpression: (
    params: ASTNode[],
    body: ASTNode,
    exp: ASTNode
  ) => ASTNode;
  blockStatement: (body: ASTNode[]) => ASTNode;
  ifStatement: (
    test: ASTNode,
    consequent: ASTNode,
    alternate?: ASTNode
  ) => ASTNode;
  returnStatement: (arg: ASTNode) => ASTNode;
  binaryExpression: (
    operator: string,
    left: ASTNode,
    right: ASTNode
  ) => ASTNode;
  importSpecifier: (identifier: ASTNode) => ASTNode;

  Property?: ExpressionObject;
  NewExpression?: ExpressionObject;
  CallExpression?: CallExpression;
  VariableDeclarator?: ExpressionObject;
  Identifier?: ExpressionObject;
  Literal?: ExpressionObject;
  ArrayExpression?: ExpressionObject;
  MemberExpression?: ExpressionObject;
  FunctionExpression?: ExpressionObject;
  ObjectExpression?: ExpressionObject;
  BlockStatement?: ExpressionObject;
  Program?: ExpressionObject;
  ArrowFunctionExpression?: ExpressionObject;
  ImportDeclaration?: ImportDeclaration;
  filters?: {
    VariableDeclarator: {
      requiresModule: Function;
    };
  };
}

export type valueType = string | number | boolean | any[] | ASTNode | null;
