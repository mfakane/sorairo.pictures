import type { APIRoute } from "astro";
import { SITE_AUTHOR, SITE_TITLE } from "@/config";
import { getArticleSourceFromUrl } from "@/models/ArticleSource";
import type { UpdatesFields } from "@/models/ApiTable";
import { JSDOM } from "jsdom";

const apiTableUrl = `https://aitable.ai/fusion/v1/datasheets/${import.meta.env.APITABLE_UPDATES_DATASHEET_ID}/records?viewId=${import.meta.env.APITABLE_UPDATES_VIEW_ID}&fieldKey=name`;
const res = await fetch(apiTableUrl, {
  method: "GET",
  headers: new Headers({
    "Content-Type": "application/json",
    Authorization: `Bearer ${import.meta.env.APITABLE_ACCESS_TOKEN}`,
  }),
});
const updatesView = await res.json();

const updates = (updatesView.data?.records ?? [])
  .map((x: any) => x.fields as UpdatesFields)
  .map((x: any) => ({
    title: x.title ?? "",
    date: x.date ? new Date(x.date) : undefined,
    permalink: x.href?.text,
    source: x.href ? getArticleSourceFromUrl(x.href.text) : undefined,
    summary: x.body ?? "",
    parent: x.parent,
  }));


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

  for (const update of updates) {
    if (!update.date || !update.permalink) continue;

    const entry = feed.appendChild(doc.createElementNS(ns, "entry"));
    entry.appendChild(doc.createElementNS(ns, "title")).textContent = update.title;

    const link = entry.appendChild(doc.createElementNS(ns, "link"));
    link.setAttribute("href", update.permalink);
    entry.appendChild(doc.createElementNS(ns, "published")).textContent = update.date.toISOString();
    entry.appendChild(doc.createElementNS(ns, "summary")).textContent = update.summary;
  }

  return {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
    body: doc.documentElement.outerHTML,
  };
};
