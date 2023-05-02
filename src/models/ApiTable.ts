export interface UpdatesFields {
  title?: string;
  status?: string;
  href?: URL;
  parent?: string;
  date?: number;
  body?: string;
  image?: URL;
}

type URL = { title: string; text: string; favicon: string; };
