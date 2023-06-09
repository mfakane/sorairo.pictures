export type ArticleSource = "Blog" | "GitHub" | "Gist" | "Log" | "Twitter" | "Nicovideo" | undefined;

export function getUrlFromArticleSource(category: ArticleSource) {
  switch (category) {
    case "Blog":
      return "https://blog.sorairo.pictures/";
    case "GitHub":
      return "https://github.com/mfakane";
    case "Gist":
      return "https://gist.github.com/mfakane";
    case "Log":
      return "https://log.sorairo.pictures/"
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
    case "blog.sorairo.pictures":
      return "Blog";
    case "github.com":
      return "GitHub";
    case "gist.github.com":
      return "Gist";
    case "log.sorairo.pictures":
      return "Log";
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
