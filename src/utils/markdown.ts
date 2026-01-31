import DOMPurify from "dompurify";

const markdownImageRegex =
  /!\[(.*?)\]\(((https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]\.(?:png|jpg|jpeg|gif|webp|bmp|svg))\b\)/gi;
const markdownLinkRegex =
  /\[(.*?)\]\((((https?|ftp|file):\/\/)[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])\)/gi;
const standaloneImageUrlRegex =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]\.(?:png|jpg|jpeg|gif|webp|bmp|svg))\b/gi;
const standaloneUrlRegex =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])(?!.*\.(?:png|jpg|jpeg|gif|webp|bmp|svg)\b)/gi;
const boldRegex = /\*\*(.*?)\*\*/g;

function buildImageHtml(url: string, alt: string): string {
  return (
    `<div class="image-container">` +
    `<a href="${url}" target="_blank" rel="noopener noreferrer">` +
    `<img src="${url}" alt="${alt}" loading="lazy" class="chat-image loading" onload="this.classList.remove('loading'); this.classList.add('loaded');" onerror="this.closest('.image-container').style.display='none';">` +
    `</a>` +
    `</div>`
  );
}

export function parseMessageContent(content: string): string {
  if (!content) return "";

  let html = content;
  const processedUrls = new Set<string>();

  html = html.replace(/\n/g, "<br>");

  html = html.replace(
    markdownImageRegex,
    (_match, altText: string, fullUrl: string) => {
      if (processedUrls.has(fullUrl)) return altText || "";
      processedUrls.add(fullUrl);
      return buildImageHtml(fullUrl, altText || "Imagen cargada");
    },
  );

  html = html.replace(
    markdownLinkRegex,
    (match, linkText: string, fullUrl: string) => {
      if (processedUrls.has(fullUrl)) return linkText;
      if (processedUrls.has(match)) return match;
      processedUrls.add(fullUrl);
      processedUrls.add(match);
      return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
    },
  );

  html = html.replace(standaloneImageUrlRegex, (match) => {
    if (processedUrls.has(match)) return match;
    processedUrls.add(match);
    return buildImageHtml(match, "Imagen cargada");
  });

  html = html.replace(standaloneUrlRegex, (match) => {
    if (processedUrls.has(match)) return match;
    processedUrls.add(match);
    return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
  });

  html = html.replace(boldRegex, "<strong>$1</strong>");

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["strong", "br", "a", "img", "div"],
    ADD_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "loading",
      "class",
      "style",
      "onload",
      "onerror",
    ],
  });
}
