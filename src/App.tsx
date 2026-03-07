import { useState } from 'react';
import './styles/design-system.css';
import './App.css';
import { TOOLS, type ToolMeta } from './registry/tools';
import { ToolCard } from './components/ToolCard';
import { ToolPage } from './components/ToolPage';
import { Base64Tool } from './tools/base64/Base64Tool';
import { JsonFormatterTool } from './tools/json-formatter/JsonFormatterTool';
import { ColorConverterTool } from './tools/color-converter/ColorConverterTool';
import { MarkdownPreviewTool } from './tools/markdown-preview/MarkdownPreviewTool';
import { UrlEncoderTool } from './tools/url-encoder/UrlEncoderTool';
import { RegexTesterTool } from './tools/regex-tester/RegexTesterTool';
import { TimestampConverterTool } from './tools/timestamp-converter/TimestampConverterTool';
import { HashGeneratorTool } from './tools/hash-generator/HashGeneratorTool';

function renderTool(id: string) {
  switch (id) {
    case 'base64': return <Base64Tool />;
    case 'json-formatter': return <JsonFormatterTool />;
    case 'color-converter': return <ColorConverterTool />;
    case 'markdown-preview': return <MarkdownPreviewTool />;
    case 'url-encoder': return <UrlEncoderTool />;
    case 'regex-tester': return <RegexTesterTool />;
    case 'timestamp-converter': return <TimestampConverterTool />;
    case 'hash-generator': return <HashGeneratorTool />;
    default: return <p>Tool not found.</p>;
  }
}

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolMeta | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <button className="app-logo app-logo--btn" onClick={() => setActiveTool(null)}>
            <span className="app-logo__icon">🧰</span>
            <span className="app-logo__name">BeginnersToolBox</span>
          </button>
          <p className="app-tagline">Simple, browser-based tools for everyday tasks.</p>
        </div>
      </header>

      <main className="app-main">
        {activeTool ? (
          <ToolPage tool={activeTool} onBack={() => setActiveTool(null)}>
            {renderTool(activeTool.id)}
          </ToolPage>
        ) : (
          <section className="tools-section">
            <h2 className="tools-section__title">All Tools</h2>
            <p className="tools-section__sub">{TOOLS.length} tools · No account needed · 100% in-browser</p>
            <div className="tools-grid">
              {TOOLS.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={() => tool.status === 'ready' && setActiveTool(tool)}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Open source ·{' '}
          <a href="https://github.com/vincenthouyi/BeginnersToolBox" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
