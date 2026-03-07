import { useState, useMemo } from 'react';
import '../tools.css';
import './MarkdownPreviewTool.css';

const SAMPLE = `# Hello, Markdown!

This is a **bold** statement and *italic* text.

## Lists

- Item one
- Item two
  - Nested item

1. First
2. Second

## Code

Inline \`code\` and a block:

\`\`\`
function greet(name) {
  return "Hello, " + name;
}
\`\`\`

## Links & Blockquotes

> This is a blockquote.

[BeginnersToolBox](https://github.com/vincenthouyi/BeginnersToolBox)
`;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inCode = false;
  let inUl = false;
  let inOl = false;

  function closeList() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }

  function inlineFormat(text: string): string {
    return text
      .replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inCode) {
        closeList();
        out.push('<pre><code>');
        inCode = true;
      } else {
        out.push('</code></pre>');
        inCode = false;
      }
      continue;
    }

    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (hMatch) {
      closeList();
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineFormat(hMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      closeList();
      out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      if (!inUl) { if (inOl) { out.push('</ol>'); inOl = false; } out.push('<ul>'); inUl = true; }
      out.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      if (!inOl) { if (inUl) { out.push('</ul>'); inUl = false; } out.push('<ol>'); inOl = true; }
      out.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      out.push('<hr>');
      continue;
    }

    // Paragraph / blank line
    if (line.trim() === '') {
      out.push('');
    } else {
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  closeList();
  if (inCode) out.push('</code></pre>');

  return out.join('\n');
}

export function MarkdownPreviewTool() {
  const [md, setMd] = useState(SAMPLE);
  const html = useMemo(() => parseMarkdown(md), [md]);

  return (
    <div className="tool-layout">
      <div className="tool-row tool-row--split" style={{ alignItems: 'stretch' }}>
        <div className="tool-panel">
          <label className="tool-label">Markdown</label>
          <textarea
            className="tool-textarea"
            style={{ minHeight: 400, flex: 1 }}
            value={md}
            onChange={(e) => setMd(e.target.value)}
            spellCheck={false}
            placeholder="Type Markdown here…"
          />
        </div>
        <div className="tool-panel">
          <label className="tool-label">Preview</label>
          <div
            className="md-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
