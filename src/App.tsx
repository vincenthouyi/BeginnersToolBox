import './styles/design-system.css';
import './styles/theme.css';
import './App.css';
import { lazy, Suspense, useEffect } from 'react';
import { initThemeSync } from './lib/theme';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { TOOLS, type ToolMeta } from './registry/tools';
import { ToolCard } from './components/ToolCard';
import { ToolPage } from './components/ToolPage';

const Base64Tool = lazy(() => import('./tools/base64/Base64Tool').then(m => ({ default: m.Base64Tool })));
const JsonFormatterTool = lazy(() => import('./tools/json-formatter/JsonFormatterTool').then(m => ({ default: m.JsonFormatterTool })));
const ColorConverterTool = lazy(() => import('./tools/color-converter/ColorConverterTool').then(m => ({ default: m.ColorConverterTool })));
const MarkdownPreviewTool = lazy(() => import('./tools/markdown-preview/MarkdownPreviewTool').then(m => ({ default: m.MarkdownPreviewTool })));
const UrlEncoderTool = lazy(() => import('./tools/url-encoder/UrlEncoderTool').then(m => ({ default: m.UrlEncoderTool })));
const RegexTesterTool = lazy(() => import('./tools/regex-tester/RegexTesterTool').then(m => ({ default: m.RegexTesterTool })));
const TimestampConverterTool = lazy(() => import('./tools/timestamp-converter/TimestampConverterTool').then(m => ({ default: m.TimestampConverterTool })));
const HashGeneratorTool = lazy(() => import('./tools/hash-generator/HashGeneratorTool').then(m => ({ default: m.HashGeneratorTool })));
const DataConverterTool = lazy(() => import('./tools/data-converter/DataConverterTool').then(m => ({ default: m.DataConverterTool })));
const JsonDiffTool = lazy(() => import('./tools/json-diff/JsonDiffTool').then(m => ({ default: m.JsonDiffTool })));
const UuidGeneratorTool = lazy(() => import('./tools/uuid-generator/UuidGeneratorTool').then(m => ({ default: m.UuidGeneratorTool })));
const MetronomeTool = lazy(() => import('./tools/metronome/MetronomeTool').then(m => ({ default: m.MetronomeTool })));
const MusicBoxDesignerTool = lazy(() => import('./tools/music-box-designer/MusicBoxDesignerTool').then(m => ({ default: m.MusicBoxDesignerTool })));
const TunerTool = lazy(() => import('./tools/tuner/TunerTool').then(m => ({ default: m.TunerTool })));
const JsonPathTool = lazy(() => import('./tools/jsonpath/JsonPathTool').then(m => ({ default: m.JsonPathTool })));
const SettingsPage = lazy(() => import('./tools/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

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
    case 'data-converter': return <DataConverterTool />;
    case 'json-diff': return <JsonDiffTool />;
    case 'uuid-generator': return <UuidGeneratorTool />;
    case 'metronome': return <MetronomeTool />;
    case 'music-box-designer': return <MusicBoxDesignerTool />;
    case 'tuner': return <TunerTool />;
    case 'jsonpath': return <JsonPathTool />;
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
  const dataFormatToolIds = ['json-formatter', 'data-converter', 'json-diff', 'jsonpath'];
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

function MusicPage() {
  const navigate = useNavigate();
  const musicTools = TOOLS.filter((tool) => tool.category === 'music');

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">Music</h2>
      <p className="tools-section__sub">Browser-based music tools — no plugins needed.</p>
      <div className="tools-grid">
        {musicTools.map((tool) => (
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

function TextPage() {
  const navigate = useNavigate();
  const textToolIds = ['markdown-preview', 'regex-tester'];
  const textTools = TOOLS.filter((tool) => textToolIds.includes(tool.id));

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">Text</h2>
      <p className="tools-section__sub">Tools for working with text and patterns.</p>
      <div className="tools-grid">
        {textTools.map((tool) => (
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

function EncodingPage() {
  const navigate = useNavigate();
  const encodingToolIds = ['base64', 'url-encoder', 'hash-generator'];
  const encodingTools = TOOLS.filter((tool) => encodingToolIds.includes(tool.id));

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">Encoding</h2>
      <p className="tools-section__sub">Encode, decode, and hash data in-browser.</p>
      <div className="tools-grid">
        {encodingTools.map((tool) => (
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

function DevPage() {
  const navigate = useNavigate();
  const devToolIds = ['color-converter', 'timestamp-converter', 'uuid-generator'];
  const devTools = TOOLS.filter((tool) => devToolIds.includes(tool.id));

  return (
    <section className="tools-section">
      <h2 className="tools-section__title">Dev</h2>
      <p className="tools-section__sub">Handy utilities for developers.</p>
      <div className="tools-grid">
        {devTools.map((tool) => (
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
      <Suspense fallback={<div className="tool-loading" />}>
        {renderTool(tool.id)}
      </Suspense>
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
            <Link className="app-nav__link" to="/text">Text</Link>
            <Link className="app-nav__link" to="/encoding">Encoding</Link>
            <Link className="app-nav__link" to="/dev">Dev</Link>
            <Link className="app-nav__link" to="/data-formats">Data Formats</Link>
            <Link className="app-nav__link" to="/music">Music</Link>
            <Link className="app-nav__link" to="/settings">Settings</Link>
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
  useEffect(() => {
    return initThemeSync();
  }, []);

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/text" element={<TextPage />} />
          <Route path="/encoding" element={<EncodingPage />} />
          <Route path="/dev" element={<DevPage />} />
          <Route path="/data-formats" element={<DataFormatsPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/settings" element={<Suspense fallback={<div className="tool-loading" />}><SettingsPage /></Suspense>} />
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
