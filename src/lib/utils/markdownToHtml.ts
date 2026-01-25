import { marked } from 'marked';

/**
 * Converts Markdown content to HTML for use with Tiptap editor
 * Preserves structure: headers (h1-h3), paragraphs, lists, tables, bold, italic
 * Handles edge cases: empty content, Mexican special characters (ñ, acentos)
 */
export function markdownToHtml(markdown: string): string {
  // Handle empty content
  if (!markdown || markdown.trim() === '') {
    return '<p></p>';
  }

  try {
    // Configure marked to handle tables and other features  
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown for tables
      breaks: false, // Don't convert single line breaks to <br>
    });

    // Convert markdown to HTML - marked.parse returns string synchronously when called with just markdown
    const html = marked.parse(markdown) as string;

    // Clean up any extra newlines and ensure proper structure
    return html
      .replace(/\n{2,}/g, '\n') // Remove excessive newlines
      .replace(/^\n+|\n+$/g, '') // Trim leading/trailing newlines
      .trim();

  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // Return original content wrapped in paragraph as fallback
    return `<p>${escapeHtml(markdown)}</p>`;
  }
}

/**
 * Escape HTML characters for safe display
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}