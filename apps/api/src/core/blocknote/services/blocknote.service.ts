import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { marked } from "marked";

@Injectable()
export class BlockNoteService {
  // Converts a BlockNoteJS/Prosemirror data structure into markdown.
  convertToMarkdown(params: { nodes: any[] }): string {
    return params.nodes.map((node) => this.processNode(node)).join("");
  }

  // New function: converts markdown text into a BlockNoteJS/Prosemirror data structure.
  createFromMarkdown(markdown: string): any[] {
    // Use marked to tokenize the markdown string.
    const tokens = marked.lexer(markdown);
    return this.tokensToNodes(tokens);
  }

  // Recursively convert marked tokens into nodes.
  protected tokensToNodes(tokens: any[]): any[] {
    const nodes = [];
    for (const token of tokens) {
      switch (token.type) {
        case "heading":
          nodes.push({
            id: randomUUID(),
            type: "heading",
            props: { textColor: "default", backgroundColor: "default", textAlignment: "left", level: token.depth },
            content: this.inlineTokensToContent(token.tokens),
            children: [],
          });
          break;
        case "paragraph":
          nodes.push({
            id: randomUUID(),
            type: "paragraph",
            props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
            content: this.inlineTokensToContent(token.tokens),
            children: [],
          });
          break;
        case "list":
          for (const item of token.items) {
            if (item.task) {
              nodes.push({
                id: randomUUID(),
                type: "checkListItem",
                props: {
                  textColor: "default",
                  backgroundColor: "default",
                  textAlignment: "left",
                  checked: item.checked || false,
                },
                content: this.inlineTokensToContent(item.tokens),
                children: [],
              });
            } else {
              nodes.push({
                id: randomUUID(),
                type: "bulletListItem",
                props: { textColor: "default", backgroundColor: "default", textAlignment: "left" },
                content: this.inlineTokensToContent(item.tokens),
                children: [],
              });
            }
          }
          break;
        case "code":
          nodes.push({
            id: randomUUID(),
            type: "codeBlock",
            props: {
              textColor: "default",
              backgroundColor: "default",
              textAlignment: "left",
              language: token.lang || "",
            },
            content: [{ type: "text", text: token.text, styles: {} }],
            children: [],
          });
          break;
        default:
          // You can add more cases here for blockquotes, horizontal rules, etc.
          break;
      }
    }
    return nodes;
  }

  // Convert inline tokens to content array.
  protected inlineTokensToContent(tokens: any[]): any[] {
    if (!tokens) return [];
    const content = [];
    for (const token of tokens) {
      switch (token.type) {
        case "text":
          // Handle nested tokens within text tokens (common in list items)
          if (token.tokens && token.tokens.length > 0) {
            content.push(...this.inlineTokensToContent(token.tokens));
          } else {
            content.push({ type: "text", text: token.text, styles: {} });
          }
          break;
        case "strong":
          // Apply bold styling properly in BlockNote format
          if (token.tokens && token.tokens.length > 0) {
            const strongContent = this.inlineTokensToContent(token.tokens);
            strongContent.forEach((item) => {
              if (item.type === "text") {
                item.styles = { ...item.styles, bold: true };
              }
            });
            content.push(...strongContent);
          } else {
            content.push({
              type: "text",
              text: token.text,
              styles: { bold: true },
            });
          }
          break;
        case "em":
          // Apply italic styling properly in BlockNote format
          if (token.tokens && token.tokens.length > 0) {
            const emContent = this.inlineTokensToContent(token.tokens);
            emContent.forEach((item) => {
              if (item.type === "text") {
                item.styles = { ...item.styles, italic: true };
              }
            });
            content.push(...emContent);
          } else {
            content.push({
              type: "text",
              text: token.text,
              styles: { italic: true },
            });
          }
          break;
        case "del":
          // Apply strikethrough styling properly in BlockNote format
          if (token.tokens && token.tokens.length > 0) {
            const delContent = this.inlineTokensToContent(token.tokens);
            delContent.forEach((item) => {
              if (item.type === "text") {
                item.styles = { ...item.styles, strike: true };
              }
            });
            content.push(...delContent);
          } else {
            content.push({
              type: "text",
              text: token.text,
              styles: { strike: true },
            });
          }
          break;
        case "codespan":
          // Apply code styling properly in BlockNote format
          content.push({
            type: "text",
            text: token.text,
            styles: { code: true },
          });
          break;
        default:
          // Fallback for any unsupported inline types.
          content.push({ type: "text", text: token.text || "", styles: {} });
          break;
      }
    }
    return content;
  }

  // Existing helper functions for converting nodes to markdown.
  protected processNode(node: any, indentLevel = 0): string {
    switch (node.type) {
      case "paragraph":
        return this.processParagraph(node);
      case "heading":
        return this.processHeading(node);
      case "bulletListItem":
        return this.processBulletListItem(node, indentLevel);
      case "numberedListItem":
        return this.processNumberedListItem(node, indentLevel);
      case "checkListItem":
        return this.processCheckListItem(node, indentLevel);
      case "codeBlock":
        return this.processCodeBlock(node);
      default:
        return "";
    }
  }

  protected processParagraph(node: any): string {
    const content = this.processContent(node.content);
    return `${content}\n\n`;
  }

  protected processHeading(node: any): string {
    const level = node.props.level || 1;
    const hashes = "#".repeat(level);
    const content = this.processContent(node.content);
    return `${hashes} ${content}\n\n`;
  }

  protected processBulletListItem(node: any, indentLevel: number): string {
    const indent = "  ".repeat(indentLevel);
    const content = this.processContent(node.content);
    let markdown = `${indent}- ${content}\n`;

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        markdown += this.processNode(child, indentLevel + 1);
      });
    }

    return markdown;
  }

  protected processNumberedListItem(node: any, indentLevel: number): string {
    const indent = "  ".repeat(indentLevel);
    const content = this.processContent(node.content);
    let markdown = `${indent}1. ${content}\n`;

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        markdown += this.processNode(child, indentLevel + 1);
      });
    }

    return markdown;
  }

  protected processCheckListItem(node: any, indentLevel: number): string {
    const indent = "  ".repeat(indentLevel);
    const checked = node.props.checked ? "x" : " ";
    const content = this.processContent(node.content);
    let markdown = `${indent}- [${checked}] ${content}\n`;

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        markdown += this.processCheckListItem(child, indentLevel + 1);
      });
    }

    return markdown;
  }

  protected processCodeBlock(node: any): string {
    const language = node.props.language || "";
    const content = this.processContent(node.content);
    return `\`\`\`${language}\n${content}\n\`\`\`\n\n`;
  }

  protected processContent(contentArray: any[]): string {
    return contentArray
      .map((contentNode) => {
        if (contentNode.type === "text") {
          const text = this.applyTextStyles(contentNode.text, contentNode.styles);
          return text;
        } else if (contentNode.type === "relationship") {
          return this.processRelationship(contentNode);
        }
        return "";
      })
      .join("");
  }

  protected applyTextStyles(text: string, styles: any): string {
    if (!styles) return text;

    if (styles.bold) {
      text = `**${text}**`;
    }
    if (styles.italic) {
      text = `*${text}*`;
    }
    if (styles.strike) {
      text = `~~${text}~~`;
    }

    return text;
  }

  protected processRelationship(node: any): string {
    return node.props.alias || "";
  }

  protected processContentNodes(nodes: any[]): string {
    return nodes
      .map((node) => {
        switch (node.type) {
          case "paragraph":
            return this.processContent(node.content || []).trim();
          case "bulletListItem":
          case "numberedListItem":
          case "checkListItem":
            return `• ${this.processContent(node.content || []).trim()}`;
          case "codeBlock":
            const language = node.props?.language || "";
            const codeContent = this.processContent(node.content || []);
            return `\`\`\`${language}\n${codeContent}\n\`\`\``;
          default:
            return this.processContent(node.content || []).trim();
        }
      })
      .filter((content) => content.length > 0)
      .join("\n");
  }
}
