import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection, reference } from "astro:content";

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      updated: z.date().optional(),
      portrait: z
        .union([
          image(),
          z.array(
            z.union([
              image(),
              z.object({
                image: image(),
                href: z.url(),
              }),
            ])
          ),
        ])
        .optional()
    }),
});

const headlineCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/headline" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      href: z.url(),
      path: reference("blog").optional(),
      image: z.union([
          image(),
          z.url(),
        ])
        .optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  headline: headlineCollection,
};
