# 🧰 BeginnersToolBox

A collection of simple, browser-based tools for everyday developer tasks — no account required, no tracking, runs entirely in your browser.

**Live site:** https://vincenthouyi.github.io/BeginnersToolBox/

---

## Tools

| Tool | Category | Status |
|------|----------|--------|
| Base64 Encoder / Decoder | Text | ✅ Ready |
| JSON Formatter | Data | ✅ Ready |
| Color Converter | Color | ✅ Ready |
| Markdown Preview | Text | ✅ Ready |
| URL Encoder / Decoder | Web | ✅ Ready |
| Regex Tester | Text | ✅ Ready |
| Timestamp Converter | Misc | ✅ Ready |
| Hash Generator | Data | ✅ Ready |

---

## Usage

Click any tool card on the home page to open it. All processing happens locally in your browser — no data is sent to any server.

Each tool also has a direct URL (hash route), for example:

- `#/tools/base64`
- `#/tools/json-formatter`
- `#/tools/regex-tester`

### Tool highlights

- **Base64** — encode or decode text with a single click; swap input/output instantly.
- **JSON Formatter** — prettify with configurable indentation (1/2/4 spaces) or minify; copy output to clipboard.
- **Color Converter** — convert between HEX, RGB, and HSL; includes a native color picker; click any CSS value to copy it.
- **Markdown Preview** — live side-by-side rendering; supports headings, bold/italic, code blocks, lists, blockquotes, and links.
- **URL Encoder / Decoder** — choose between `encodeURIComponent` (component mode) and `encodeURI` (full URL mode).
- **Regex Tester** — real-time match highlighting with per-match detail (index, capture groups); supports all JS flags.
- **Timestamp Converter** — converts Unix timestamps (seconds or milliseconds) ↔ human-readable dates; includes a "Now" button.
- **Hash Generator** — uses the browser Web Crypto API to compute SHA-1, SHA-256, SHA-384, and SHA-512 hashes.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- [Vite](https://vite.dev) — build tool
- [React](https://react.dev) — UI framework
- [TypeScript](https://www.typescriptlang.org) — type safety
- CSS custom properties — design system (no CSS framework dependency)
- Web Crypto API — hashing (SHA-1/256/384/512)

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

MIT
