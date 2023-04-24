export default class Feedly {
  private baseUrl = "https://api.feedly.com/v3";

  constructor(private accessToken: string) {
  }

  async getStreamContents(streamId: string): Promise<StreamContents> {
    const url = `${this.baseUrl}/streams/contents?streamId=${streamId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });
    return await response.json();
  }
}

export interface StreamContents {
  id: string;
  title?: string;
  direction?: string;
  continuation?: string;
  alternate?: readonly Alternate[];
  updated?: number;
  items: readonly Item[];
}

export interface Alternate {
  href: string;
  type: string;
}

export interface Item {
  id: string;
  unread: boolean;
  categories: readonly ItemRef[];
  tags: readonly ItemRef[];
  title: string;
  published: number;
  updated: number;
  crawled: number;
  alternate: readonly Alternate[];
  canonicalUrl: string;
  fullContent: string;
  content: Content;
  author: string;
  origin: Origin;
}

export interface ItemRef {
  id: string;
  label: string;
}

export interface Content {
  direction: string;
  content: string;
}

export interface Origin {
  streamId: string;
  title: string;
  htmlUrl: string;
}

