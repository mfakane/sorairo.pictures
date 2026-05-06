import type { RemarkPlugin } from "@astrojs/markdown-remark";
import type mdast from "mdast";
import { findAndReplace, type Find, type Replace } from "mdast-util-find-and-replace";

const faRegex = /:(fa[a-z]?)-([a-z]+):/g;
const replacers: [Find, Replace][] = [
  [faRegex, replaceEmoji]
];

function replaceEmoji(_: string, type?: string, icon?: string): false | mdast.Html {
  if (typeof type === "undefined" || typeof icon === "undefined") {
    return false;
  }

  return {
    type: "html",
    value: `<i class="${type} fa-${icon} fa-fw" aria-hidden="true"></i>`
  };
}

export const remarkFa: RemarkPlugin = () =>
  tree => findAndReplace(tree, replacers);
