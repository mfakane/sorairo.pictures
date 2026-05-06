import type { RemarkPlugin } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import fauxRemarkEmbedder from "@remark-embedder/core";
import fauxOembedTransformer, { type Config } from "@remark-embedder/transformer-oembed";
import relativeLinks from "astro-relative-links";
import { defineConfig } from "astro/config";
import path from "path";
import remarkBehead from "remark-behead";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import { rehypeFigure } from "./src/lib/rehype-figure";
import { rehypeImgProps } from "./src/lib/rehype-imgprops";
import { remarkDownload } from "./src/lib/remark-download";
import { remarkFa } from "./src/lib/remark-fa";
import { remarkMarkdownLinks } from "./src/lib/remark-markdown-links";

type MaybeDefault<T> = T | { default: T };

const unwrapDefault = <T>(mod: MaybeDefault<T>): T =>
  (typeof mod === "object" && mod !== null && "default" in mod)
    ? mod.default
    : mod;

const remarkEmbedder = unwrapDefault(fauxRemarkEmbedder);
const oembedTransformer = unwrapDefault(fauxOembedTransformer);

const defaultLayoutPlugin: RemarkPlugin = () =>
  (tree, file) => {
    const relativePath = path.relative(file.cwd, file.history[0]);

    if (relativePath.startsWith("src/pages/") &&
      file.data.astro?.frontmatter) {
      file.data.astro.frontmatter.layout ??= "@/layouts/MarkdownLayout.astro";
    };
  };

// https://astro.build/config
export default defineConfig({
  site: "https://sorairo.pictures/",
  markdown: {
    remarkPlugins: [
      defaultLayoutPlugin,
      remarkMarkdownLinks,
      remarkFa,
      remarkBreaks,
      remarkDownload,
      remarkDirective,
      [remarkEmbedder as RemarkPlugin, {
        transformers: [
          [oembedTransformer, { params: { dnt: true, omit_script: true } } as Config]
        ]
      } as Parameters<typeof remarkEmbedder>[0]],
      [remarkBehead, { minDepth: 2 } as Parameters<typeof remarkBehead>[0]]
    ],
    rehypePlugins: [
      rehypeImgProps,
      rehypeFigure
    ]
  },
  integrations: [mdx(), relativeLinks()],
  prefetch: {
    prefetchAll: true
  }
});
