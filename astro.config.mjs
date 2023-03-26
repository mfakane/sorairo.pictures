import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";

const defaultLayoutPlugin = () =>
    (tree, file) => {
        file.data.astro.frontmatter.layout ??= "@/layouts/MarkdownLayout.astro"
    };

// https://astro.build/config
export default defineConfig({
    site: "https://sorairo.pictures/",
    markdown: {
        remarkPlugins: [defaultLayoutPlugin]
    },
    integrations: [mdx()]
});
