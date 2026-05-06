import type { RehypePlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

// Pattern like {.keyonly key=value key2="value with spaces" key3=true}
const optionsKeyValueRegex = /(?<key>[^\s=]+)(?:=(?:[""“”](?<value_dq>[^"“”]*)[""“”]|'(?<value_sq>[^']*)'|(?<value_r>[^\s]+)))?/g;

export const rehypeImgProps: RehypePlugin = () =>
  tree => visit(tree, "element", (node) => {
    if (
      node.tagName !== "p" ||
      node.children.length < 2 ||
      node.children[0]?.type !== "element" ||
      node.children[0].tagName !== "img" ||
      node.children[1]?.type !== "text"
    ) return;


    const img = node.children[0];
    const optionsString = node.children[1].value;
    if (!optionsString.startsWith("{") || !optionsString.endsWith("}")) return;

    const options: Record<string, string | boolean | number> = {};
    for (const match of optionsString.slice(1, -1).matchAll(optionsKeyValueRegex)) {
      if (!match) continue;

      const key = match.groups?.["key"];
      if (typeof key !== "string") continue;

      const value = match.groups?.["value_dq"] ?? match.groups?.["value_sq"] ?? match.groups?.["value_r"] ?? true;

      if (key.startsWith(".") && value) {
        options["class"] = (options["class"] ? `${options["class"]} ` : "") + key.slice(1);
      } else {
        options[key] = value;
      }
    }

    img.properties = {
      ...img.properties,
      ...options
    };
    node.children.splice(1, 1);
  });
