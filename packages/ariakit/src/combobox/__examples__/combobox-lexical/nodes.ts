import { EditorConfig, LexicalNode, NodeKey, TextNode } from "lexical";

export {
  HeadingNode,
  $createHeadingNode,
  $isHeadingNode,
  QuoteNode,
  $createQuoteNode,
  $isQuoteNode,
} from "@lexical/rich-text";

export class StyledNode extends TextNode {
  __className?: string;

  static getType() {
    return "styled";
  }

  static clone(node: StyledNode) {
    return new StyledNode(node.__text, node.__className, node.__key);
  }

  constructor(text: string, className?: string, key?: NodeKey) {
    super(text, key);
    this.__className = className;
  }

  createDOM(config: EditorConfig) {
    const dom = super.createDOM(config);
    if (this.__className) {
      dom.classList.add(this.__className);
    }
    return dom;
  }
}

export function $createStyledNode(text: string, className: string) {
  const node = new StyledNode(text, className);
  node.setMode("segmented").toggleDirectionless();
  return node;
}

export function $isStyledNode(node: LexicalNode): node is StyledNode {
  return node instanceof StyledNode;
}
