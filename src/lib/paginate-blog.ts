import type { Page, PaginateFunction } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";

type BlogEntry = CollectionEntry<"blog">;
type NoParams = Record<never, never>;

type GroupParams = Record<string, string>;

type GroupedEntries<P extends GroupParams> = {
  params: P;
  entries: BlogEntry[];
};

type IndexProps<P extends GroupParams> = P & {
  entries: BlogEntry[];
  currentPage: number;
  lastPage: number;
};

type PagedProps<P extends GroupParams> = P & {
  page: Page<BlogEntry>;
};

type PaginatedPath<P extends GroupParams> = {
  params: {
    [K in keyof P]: P[K];
  } & {
    page: string | undefined;
  };
  props: {
    page: Page<BlogEntry>;
  };
};

export type TagIndexPath = {
  params: {
    tag: string;
  };
  props: IndexProps<{ tag: string }>;
};

export type TagPagePath = {
  params: {
    tag: string;
    page: string;
  };
  props: PagedProps<{ tag: string }>;
};

export type EntryIndexPath = {
  params: NoParams;
  props: IndexProps<NoParams>;
};

export type EntryPagePath = {
  params: {
    page: string;
  };
  props: PagedProps<NoParams>;
};

export type MonthIndexPath = {
  params: {
    year: string;
    month: string;
  };
  props: IndexProps<{ year: string; month: string }>;
};

export type MonthPagePath = {
  params: {
    year: string;
    month: string;
    page: string;
  };
  props: PagedProps<{ year: string; month: string }>;
};

export type CategoryIndexPath = {
  params: {
    category: string;
  };
  props: IndexProps<{ category: string }>;
};

export type CategoryPagePath = {
  params: {
    category: string;
    page: string;
  };
  props: PagedProps<{ category: string }>;
};

const isPagePath = <P extends GroupParams>(
  path: PaginatedPath<P>,
): path is PaginatedPath<P> & { params: P & { page: string } } =>
  path.params.page !== undefined;

export async function getSortedBlogEntries(): Promise<BlogEntry[]> {
  return (await getCollection("blog")).toSorted(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export function groupEntriesByTag(
  entries: BlogEntry[],
): GroupedEntries<{ tag: string }>[] {
  const grouped = entries.reduce(
    (groups, entry) => {
      entry.data.tags?.forEach((tag) => {
        if (!groups[tag]) {
          groups[tag] = [];
        }
        groups[tag].push(entry);
      });
      return groups;
    },
    {} as Record<string, BlogEntry[]>,
  );

  return Object.entries(grouped).map(([tag, groupedEntries]) => ({
    params: { tag },
    entries: groupedEntries,
  }));
}

export function groupEntriesByCategory(
  entries: BlogEntry[],
): GroupedEntries<{ category: string }>[] {
  const grouped = entries.reduce(
    (groups, entry) => {
      const category = entry.data.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(entry);
      return groups;
    },
    {} as Record<string, BlogEntry[]>,
  );

  return Object.entries(grouped).map(([category, groupedEntries]) => ({
    params: { category },
    entries: groupedEntries,
  }));
}

export function groupEntriesByYearMonth(
  entries: BlogEntry[],
): GroupedEntries<{ year: string; month: string }>[] {
  const grouped = entries.reduce(
    (groups, entry) => {
      const year = String(entry.data.date.getFullYear());
      const month = String(entry.data.date.getMonth() + 1).padStart(2, "0");
      const key = `${year}/${month}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
      return groups;
    },
    {} as Record<string, BlogEntry[]>,
  );

  return Object.entries(grouped).map(([key, groupedEntries]) => {
    const [year, month] = key.split("/");
    return {
      params: {
        year: String(year),
        month: String(month),
      },
      entries: groupedEntries,
    };
  });
}

async function getGroupedPaginatedPaths<P extends GroupParams>(
  paginate: PaginateFunction,
  groupedEntries: GroupedEntries<P>[],
  pageSize = 5,
): Promise<PaginatedPath<P>[]> {
  return groupedEntries.flatMap(
    ({ params, entries }) =>
      paginate(entries, {
        pageSize,
        params,
      }) as unknown as PaginatedPath<P>[],
  ).filter(x => x.props.page.currentPage > 1);
}

function getIndexPaths<P extends GroupParams>(
  groupedEntries: GroupedEntries<P>[],
  pageSize = 5,
): { params: P; props: IndexProps<P> }[] {
  return groupedEntries.map(({ params, entries }) => ({
    params,
    props: {
      ...params,
      entries: entries.slice(0, pageSize),
      currentPage: 1,
      lastPage: Math.max(1, Math.ceil(entries.length / pageSize)),
    },
  }));
}

async function getPagePaths<P extends GroupParams>(
  paginate: PaginateFunction,
  groupedEntries: GroupedEntries<P>[],
): Promise<{ params: P & { page: string }; props: PagedProps<P> }[]> {
  return (await getGroupedPaginatedPaths(paginate, groupedEntries))
    .filter(isPagePath)
    .map(({ params, props }) => {
      const groupParams = { ...params };
      delete (groupParams as { page?: string }).page;
      return {
        params,
        props: {
          ...(groupParams as unknown as P),
          page: props.page,
        },
      };
    });
}

export async function getEntryIndexPaths(
): Promise<EntryIndexPath[]> {
  const groupedEntries: GroupedEntries<NoParams>[] = [
    {
      params: {},
      entries: await getSortedBlogEntries(),
    },
  ];
  return getIndexPaths(groupedEntries);
}

export async function getEntryPagePaths(
  paginate: PaginateFunction,
): Promise<EntryPagePath[]> {
  const groupedEntries: GroupedEntries<NoParams>[] = [
    {
      params: {},
      entries: await getSortedBlogEntries(),
    },
  ];
  return getPagePaths(paginate, groupedEntries);
}

export async function getMonthIndexPaths(
): Promise<MonthIndexPath[]> {
  const groupedEntries = groupEntriesByYearMonth(await getSortedBlogEntries());
  return getIndexPaths(groupedEntries);
}

export async function getMonthPagePaths(
  paginate: PaginateFunction,
): Promise<MonthPagePath[]> {
  const groupedEntries = groupEntriesByYearMonth(await getSortedBlogEntries());
  return getPagePaths(paginate, groupedEntries);
}

export async function getCategoryIndexPaths(
): Promise<CategoryIndexPath[]> {
  const groupedEntries = groupEntriesByCategory(await getSortedBlogEntries());
  return getIndexPaths(groupedEntries);
}

export async function getCategoryPagePaths(
  paginate: PaginateFunction,
): Promise<CategoryPagePath[]> {
  const groupedEntries = groupEntriesByCategory(await getSortedBlogEntries());
  return getPagePaths(paginate, groupedEntries);
}

export async function getTagIndexPaths(
): Promise<TagIndexPath[]> {
  const groupedEntries = groupEntriesByTag(await getSortedBlogEntries());
  return getIndexPaths(groupedEntries);
}

export async function getTagPagePaths(
  paginate: PaginateFunction,
): Promise<TagPagePath[]> {
  const groupedEntries = groupEntriesByTag(await getSortedBlogEntries());
  return getPagePaths(paginate, groupedEntries);
}
