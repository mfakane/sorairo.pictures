import type { RehypePlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

export const rehypeFigure: RehypePlugin = () =>
  tree => visit(tree, "element", (node, index, parent) => {
    if (!parent || index === undefined) return;

    if (
      node.tagName !== "p" ||
      node.children.length !== 1 ||
      node.children[0]?.type !== "element" ||
      node.children[0].tagName !== "img"
    ) return;

    const img = node.children[0];
    const caption = String(img.properties?.title ?? "");
    if (caption.length === 0) return;

    parent.children[index] = {
      type: "element",
      tagName: "figure",
      properties: { className: ["image"] },
      children: [
        img,
        {
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: caption }]
        }
      ]
    };
  });
