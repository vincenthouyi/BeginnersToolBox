import './styles/design-system.css';
import './App.css';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
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

function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">All Tools</h2>
      <p className="tools-section__sub">{TOOLS.length} tools · No account needed · 100% in-browser</p>
      <div className="tools-grid">
        {TOOLS.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => tool.status === 'ready' && navigate(`/tools/${tool.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

function DataFormatsPage() {
  const navigate = useNavigate();
  const dataFormatToolIds = ['json-formatter'];
  const dataFormatTools = TOOLS.filter((tool) => dataFormatToolIds.includes(tool.id));

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">Data Formats</h2>
      <p className="tools-section__sub">JSON, YAML, CSV, and more (in-browser).</p>
      <div className="tools-grid">
        {dataFormatTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => tool.status === 'ready' && navigate(`/tools/${tool.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

function ToolRoutePage() {
  const { toolId } = useParams();
  const navigate = useNavigate();
  const tool = TOOLS.find((item) => item.id === toolId) as ToolMeta | undefined;

  if (!tool || tool.status !== 'ready') {
    return <Navigate to="/" replace />;
  }

  return (
    <ToolPage tool={tool} onBack={() => navigate('/')}>
      {renderTool(tool.id)}
    </ToolPage>
  );
}

function Header() {
  const location = useLocation();
  const atHome = location.pathname === '/';

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__top">
          <Link className="app-logo app-logo--btn" to="/">
            <span className="app-logo__icon">🧰</span>
            <span className="app-logo__name">BeginnersToolBox</span>
          </Link>

          <nav className="app-nav" aria-label="Primary">
            <Link className="app-nav__link" to="/data-formats">Data Formats</Link>
          </nav>
        </div>

        <p className="app-tagline">
          {atHome ? 'Simple, browser-based tools for everyday tasks.' : 'Tool page with shareable URL.'}
        </p>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/data-formats" element={<DataFormatsPage />} />
          <Route path="/tools/:toolId" element={<ToolRoutePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
