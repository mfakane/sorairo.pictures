import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updated: z.date().optional(),
  }),
});

const updatesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.string(),
    date: z.date(),
    href: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = {
  "blog": blogCollection,
  "updates": updatesCollection,
};
