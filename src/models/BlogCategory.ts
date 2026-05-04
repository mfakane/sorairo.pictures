export type BlogCategory = "diary" | "kb" | "notice" | "review";

export function getBlogCategoryDisplayName(category: BlogCategory) {
  switch (category) {
    case "diary":
      return "Diary";
    case "kb":
      return "Knowledge";
    case "notice":
      return "Notice";
    case "review":
      return "Review";
  }
}
