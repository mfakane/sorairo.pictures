import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

export const remarkDownload: RemarkPlugin = () =>
  tree => visit(tree, "link", (node, index, parent) => {
    if (!parent || index === undefined) return;

    if (!node.url.startsWith("https://download.sorairo.pictures/")) return;

    parent.children[index] = {
      type: "html",
      value: `<a href="${node.url}" rel="nofollow"><i class="fas fa-download fa-fw" aria-hidden="true"></i> Download</a>`
    };
  });
