import type { CollectionEntry } from "astro:content";

export type BlogEntryRouteParams = {
  slug: string;
};

function getBlogEntrySlug(entryId: string): string {
  const fileName = entryId.split("/").at(-1) ?? entryId;

  return fileName.replace(/\.mdx?$/, "");
}

export function getBlogEntryRouteParams(
  entry: CollectionEntry<"blog">,
): BlogEntryRouteParams {
  return {
    slug: getBlogEntrySlug(entry.id)
  };
}

export function getBlogEntryPermalink(entry: CollectionEntry<"blog">): string {
  return getBlogEntryPermalinkFromId(entry.id);
}

export function getBlogEntryPermalinkFromId(entryId: string): string {
  const slug = getBlogEntrySlug(entryId);

  return `/blog/${slug}`;
}
