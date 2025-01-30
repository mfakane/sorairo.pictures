import { z, defineCollection, reference } from "astro:content";

const blogCollection = defineCollection({
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
                href: z.string().url(),
              }),
            ])
          ),
        ])
        .optional()
    }),
});

const headlineCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.date(),
      href: z.string().url(),
      path: reference("blog").optional(),
      image: z.union([
          image(),
          z.string().url(),
        ])
        .optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  headline: headlineCollection,
};
