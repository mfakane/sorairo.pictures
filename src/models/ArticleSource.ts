export type ArticleSource = "GitHub" | "Gist" | "Twitter" | "Nicovideo" | undefined;

export function getUrlFromArticleSource(category: ArticleSource) {
  switch (category) {
    case "GitHub":
      return "https://github.com/mfakane";
    case "Gist":
      return "https://gist.github.com/mfakane";
    case "Twitter":
      return "https://twitter.com/mfakane";
    case "Nicovideo":
      return "https://www.nicovideo.jp/user/424070";
    default:
      return undefined;
  }
}

export function getArticleSourceFromUrl(url: string): ArticleSource {
  const urlObject = new URL(url);

  switch (urlObject.hostname) {
    case "github.com":
      return "GitHub";
    case "gist.github.com":
      return "Gist";
    case "twitter.com":
      return "Twitter";
    case "www.nicovideo.jp":
    case "3d.nicovideo.jp":
    case "seiga.nicovideo.jp":
      return "Nicovideo";
    default:
      return undefined;
  }
}
