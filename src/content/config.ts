import { z, defineCollection } from "astro:content";

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
                href: z.string(),
              }),
            ])
          ),
        ])
        .optional(),
    }),
});

export const collections = {
  blog: blogCollection,
};
