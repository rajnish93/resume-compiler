import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked link rendering: anchor links (#) remain in-page, external links open in a new tab
marked.use({
  renderer: {
    link({ href, title, text }) {
      const cleanHref = href || '';
      const titleAttr = title ? ` title="${title}"` : '';
      if (cleanHref.startsWith('#')) {
        return `<a href="${cleanHref}"${titleAttr}>${text}</a>`;
      }
      return `<a href="${cleanHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
  }
});

/**
 * Parses Markdown content to HTML and applies resume post-processing
 * (e.g. converting headers + pipe-separated lists to .meta-row tables).
 * Sanitizes output HTML using DOMPurify to prevent XSS attacks across client and SSR.
 */
export function parseMarkdown(markdownText: string): string {
  if (!markdownText) return '';

  // Parse Markdown to HTML synchronously
  let htmlBody = marked.parse(markdownText, { async: false }) as string;

  // Post-process metadata rows.
  const pattern = /<(h[34])>([\s\S]*?)<\/\1>\s*<p>([\s\S]*?\|[\s\S]*?)<\/p>/g;

  htmlBody = htmlBody.replace(pattern, (_, level, title, meta) => {
    const parts = meta.split('|').map((p: string) => p.trim());
    const left = parts[0];
    const right = parts.slice(1).join(', ');
    return `<${level}>${title}</${level}>
<div class="meta-row">
    <span class="meta-left">${left}</span>
    <span class="meta-right">${right}</span>
</div>`;
  });

  // Obtain DOMPurify instance (client browser window or server-side DOM window)
  let purifier: typeof DOMPurify | ReturnType<typeof DOMPurify>;
  if (typeof window !== 'undefined') {
    purifier = DOMPurify;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom');
    const windowObj = new JSDOM('').window;
    purifier = DOMPurify(windowObj as unknown as Parameters<typeof DOMPurify>[0]);
  }

  return purifier.sanitize(htmlBody, {
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'base', 'head', 'link'],
  });
}

/**
 * Sanitizes custom CSS text to prevent HTML tag breakout when injected inside <style> elements.
 */
export function sanitizeCss(cssText: string): string {
  if (!cssText) return '';
  return cssText.replace(/<\/style/gi, '\\3C/style');
}
