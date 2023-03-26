import type { CollectionEntry } from "astro:content";
import { getArticleSourceFromUrl, ArticleSource } from "./ArticleSource";

export interface ArticleSummary {
  title: string;
  date: Date;
  category?: string;
  permalink: string;
  source: ArticleSource;
  summary: string;
}

export async function getArticleSummaries(updates: readonly CollectionEntry<"updates">[]): Promise<readonly ArticleSummary[]> {
  const result: ArticleSummary[] = [];

  for (const update of updates) {
    result.push({
      title: update.data.title,
      date: update.data.date,
      category: update.data.category,
      permalink: update.data.href,
      source: getArticleSourceFromUrl(update.data.href),
      summary: update.body,
    });
  }

  result.sort((a, b) => b.date.getTime() - a.date.getTime());

  return result;
}
