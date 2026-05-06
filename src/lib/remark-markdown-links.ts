import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { visit } from "unist-util-visit";
import { getBlogEntryPermalinkFromId } from "./blog-entry-path";

const externalUrlPattern = /^[a-z][a-z0-9+.-]*:/i;
const markdownContentRoot = "src/content";
const markdownExtensionPattern = /\.mdx?$/;
const markdownInlineLinkPattern = /\[[^\]]*\]\(([^)]+)\)/g;

type ContentCollectionName = "blog" | "site";
type ContentCollectionDefinition = {
  name: ContentCollectionName;
  rootDir: string;
  permalinkFromId: (entryId: string) => string;
};

type LinkNode = {
  type: "link";
  url: string;
};

const markdownLinkCollections: ContentCollectionDefinition[] = [
  {
    name: "blog",
    rootDir: `${markdownContentRoot}/blog`,
    permalinkFromId: getBlogEntryPermalinkFromId,
  },
  {
    name: "site",
    rootDir: `${markdownContentRoot}/site`,
    permalinkFromId: (entryId) => getSiteEntryPermalinkFromId(entryId),
  },
];

function getSiteEntryPermalinkFromId(entryId: string): string {
  return `/${entryId.replace(markdownExtensionPattern, "")}`;
}

function getMarkdownLinkCollectionBySourcePath(
  relativeSourceFile: string,
): ContentCollectionDefinition | undefined {
  const normalizedPath = normalizeContentPath(relativeSourceFile);

  return markdownLinkCollections.find((collection) =>
    normalizedPath.startsWith(`${collection.rootDir}/`)
  );
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  const dirents = await readdir(rootDir, { withFileTypes: true });
  const nestedFiles = await Promise.all(dirents.map(async (dirent) => {
    const fullPath = path.join(rootDir, dirent.name);

    if (dirent.isDirectory()) {
      return collectMarkdownFiles(fullPath);
    }

    if (!dirent.isFile() || dirent.name.startsWith("_") || !markdownExtensionPattern.test(dirent.name)) {
      return [];
    }

    return [fullPath];
  }));

  return nestedFiles.flat();
}

async function createPermalinkMap(
  collection: ContentCollectionDefinition,
): Promise<Map<string, string>> {
  const absoluteRootDir = path.resolve(collection.rootDir);

  const files = await collectMarkdownFiles(absoluteRootDir);
  const entries = await Promise.all(files.map(async (filePath) => {
    const relativePath = normalizeContentPath(path.relative(absoluteRootDir, filePath));

    return [relativePath, collection.permalinkFromId(relativePath)] as const;
  }));

  return new Map(entries);
}

function stripMarkdownLinkDestination(rawDestination: string): string {
  const withoutTitle = rawDestination.trim().split(/\s+/, 1)[0] ?? "";

  if (withoutTitle.startsWith("<") && withoutTitle.endsWith(">")) {
    return withoutTitle.slice(1, -1);
  }

  return withoutTitle;
}

function collectMarkdownLinkUrls(source: string): string[] {
  const urls: string[] = [];

  for (const match of source.matchAll(markdownInlineLinkPattern)) {
    const rawDestination = match[1];
    if (!rawDestination) continue;

    urls.push(stripMarkdownLinkDestination(rawDestination));
  }

  return urls;
}

function resolvePermalinkFromCollections(
  permalinkMapByCollection: Map<ContentCollectionName, Map<string, string>>,
  resolvedPath: string,
): string | undefined {
  for (const targetCollection of markdownLinkCollections) {
    const absoluteTargetRoot = path.resolve(targetCollection.rootDir);
    const relativeTargetPath = normalizeContentPath(
      path.relative(absoluteTargetRoot, resolvedPath),
    );

    if (relativeTargetPath.startsWith("../") || relativeTargetPath === "..") {
      continue;
    }

    const permalink = permalinkMapByCollection.get(targetCollection.name)?.get(relativeTargetPath);
    if (permalink) {
      return permalink;
    }
  }

  return undefined;
}

async function validateAllMarkdownLinks(
  permalinkMapByCollection: Map<ContentCollectionName, Map<string, string>>,
): Promise<void> {
  for (const collection of markdownLinkCollections) {
    const absoluteRootDir = path.resolve(collection.rootDir);
    const files = await collectMarkdownFiles(absoluteRootDir);

    for (const filePath of files) {
      const source = await readFile(filePath, "utf8");
      const relativeSourcePath = normalizeContentPath(path.relative(process.cwd(), filePath));
      const sourceDir = path.dirname(filePath);

      for (const url of collectMarkdownLinkUrls(source)) {
        if (!shouldRewrite(url)) {
          continue;
        }

        const { pathname } = splitUrl(url);
        const resolvedPath = path.resolve(sourceDir, pathname);
        const permalink = resolvePermalinkFromCollections(permalinkMapByCollection, resolvedPath);

        if (!permalink) {
          throw new Error(
            `Unresolved markdown link from ${collection.name}: ${url} in ${relativeSourcePath}`,
          );
        }
      }
    }
  }
}

function normalizeContentPath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function splitUrl(url: string): { pathname: string; suffix: string } {
  const match = url.match(/^([^?#]+)(.*)$/);

  return {
    pathname: match?.[1] ?? url,
    suffix: match?.[2] ?? "",
  };
}

function shouldRewrite(url: string): boolean {
  if (!url || url.startsWith("#") || url.startsWith("/")) return false;
  if (externalUrlPattern.test(url)) return false;

  const { pathname } = splitUrl(url);
  return markdownExtensionPattern.test(pathname);
}

export const remarkMarkdownLinks: RemarkPlugin = () => {
  const permalinkMapByCollectionPromise = Promise.all(markdownLinkCollections.map(async (collection) => [
    collection.name,
    await createPermalinkMap(collection),
  ] as const)).then(async (entries) => {
    const permalinkMapByCollection = new Map(entries);
    await validateAllMarkdownLinks(permalinkMapByCollection);
    return permalinkMapByCollection;
  });

  return async (tree, file) => {
    const sourceFile = file.history[0];
    if (!sourceFile) return;

    const relativeSourceFile = normalizeContentPath(path.relative(file.cwd, sourceFile));
    const sourceCollection = getMarkdownLinkCollectionBySourcePath(relativeSourceFile);
    if (!sourceCollection) return;

    const permalinkMapByCollection = await permalinkMapByCollectionPromise;
    const sourceDir = path.dirname(sourceFile);

    visit(tree, "link", (node: LinkNode) => {
      if (!shouldRewrite(node.url)) return;

      const { pathname, suffix } = splitUrl(node.url);
      const resolvedPath = path.resolve(sourceDir, pathname);

      const permalink = resolvePermalinkFromCollections(permalinkMapByCollection, resolvedPath);
      if (permalink) {
        node.url = `${permalink}${suffix}`;
        return;
      }

      throw new Error(
        `Unresolved markdown link from ${sourceCollection.name}: ${node.url} in ${relativeSourceFile}`,
      );
    });
  };
};
