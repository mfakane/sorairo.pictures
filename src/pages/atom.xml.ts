import type { APIRoute } from "astro";
import { SITE_AUTHOR, SITE_TITLE } from "@/config";
import { getArticleSourceFromUrl } from "@/models/ArticleSource";
import { APITable } from "apitable";
import type { UpdatesFields } from "@/models/ApiTable";
import { JSDOM } from "jsdom";

const apitable = new APITable({
  token: import.meta.env.APITABLE_ACCESS_TOKEN,
  fieldKey: "name",
});
const datasheet = apitable.datasheet(
  import.meta.env.APITABLE_UPDATES_DATASHEET_ID
);
const updatesView = await datasheet.records.query({
  viewId: import.meta.env.APITABLE_UPDATES_VIEW_ID,
});

const updates = (updatesView.data?.records ?? [])
  .map((x) => x.fields as UpdatesFields)
  .map((x) => ({
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
