import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE_AUTHOR, SITE_TITLE } from "@/config";
import { getArticleSourceFromUrl } from "@/models/ArticleSource";
import { JSDOM } from "jsdom";

const headlines = (await getCollection("headline"))
  .map((x) => ({
    title: x.data.title ?? "",
    date: x.data.date,
    permalink: x.data.href,
    source: x.data.href ? getArticleSourceFromUrl(x.data.href) : undefined,
    summary: x.body ?? "",
    path: x.data.path,
    image: x.data.image,
  }))
  .sort((a, b) => b.date.valueOf() - a.date.valueOf());


export const get: APIRoute = ({ site }) => {
  const dom = new JSDOM();
  const ns = "http://www.w3.org/2005/Atom";
  const doc = dom.window.document.implementation.createDocument(ns, "feed", null);

  const feed = doc.documentElement;
  feed.appendChild(doc.createElementNS(ns, "title")).textContent = SITE_TITLE;

  const linkSelf = feed.appendChild(doc.createElementNS(ns, "link"));
  linkSelf.setAttribute("href", "/atom.xml");
  linkSelf.setAttribute("rel", "self");

  const linkSite = feed.appendChild(doc.createElementNS(ns, "link"));
  linkSite.setAttribute("href", site?.href ?? "");

  feed.appendChild(doc.createElementNS(ns, "updated")).textContent = new Date().toISOString();
  feed.appendChild(doc.createElementNS(ns, "id")).textContent = site?.href ?? "";

  const author = feed.appendChild(doc.createElementNS(ns, "author"));
  author.appendChild(doc.createElementNS(ns, "name")).textContent = SITE_AUTHOR;

  const generator = feed.appendChild(doc.createElementNS(ns, "generator"));
  generator.setAttribute("uri", "https://astro.build/");

  for (const post of headlines) {
    if (!post.date || !post.permalink) continue;

    const entry = feed.appendChild(doc.createElementNS(ns, "entry"));
    entry.appendChild(doc.createElementNS(ns, "title")).textContent = post.title;

    const link = entry.appendChild(doc.createElementNS(ns, "link"));
    link.setAttribute("href", post.permalink);
    entry.appendChild(doc.createElementNS(ns, "published")).textContent = post.date.toISOString();
    entry.appendChild(doc.createElementNS(ns, "summary")).textContent = post.summary;
  }

  return new Response(doc.documentElement.outerHTML,
    {
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
      }
    });
};
