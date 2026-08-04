import { marked } from 'marked';

/**
 * Parses Markdown content to HTML and applies resume post-processing
 * (e.g. converting headers + pipe-separated lists to .meta-row tables).
 */
export function parseMarkdown(markdownText: string): string {
  // Parse Markdown to HTML synchronously
  let htmlBody = marked.parse(markdownText, { async: false }) as string;

  // Post-process metadata rows. Matches:
  // <h3/h4>Title</h3/h4>
  // <p><strong>Company</strong> | <em>Date</em> | <em>Location</em></p>
  //
  // Replaces it with the two-column meta-row layout.
  // The 's' flag makes the dot (.) match newlines, equivalent to re.DOTALL in Python.
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

  return htmlBody;
}
