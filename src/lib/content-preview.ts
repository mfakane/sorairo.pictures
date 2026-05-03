export const MORE_MARKER = "<!-- more -->";

export function getExcerptHtmlFromRenderedContent(
  renderedHtml?: string,
  marker = MORE_MARKER,
): string | undefined {
  if (!renderedHtml) {
    return undefined;
  }

  const markerIndex = renderedHtml.indexOf(marker);
  if (markerIndex < 0) {
    return undefined;
  }

  return renderedHtml.slice(0, markerIndex);
}
