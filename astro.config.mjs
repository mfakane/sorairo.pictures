import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import path from "path";
import remarkBreaks from "remark-breaks";

const defaultLayoutPlugin = () =>
    (tree, file) => {
        const relativePath = path.relative(file.cwd, file.history[0]);

        if (relativePath.startsWith("src/pages/"))
            file.data.astro.frontmatter.layout ??= "@/layouts/MarkdownLayout.astro";
    };

// https://astro.build/config
export default defineConfig({
    site: "https://sorairo.pictures/",
    markdown: {
        remarkPlugins: [defaultLayoutPlugin, remarkBreaks]
    },
    integrations: [mdx()],
    prefetch: {
        prefetchAll: true
    }
});
