import { z, defineCollection } from "astro:content";

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
  "updates": updatesCollection,
};
