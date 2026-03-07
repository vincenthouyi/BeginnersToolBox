import './styles/design-system.css';
import './App.css';
import { TOOLS } from './registry/tools';
import { ToolCard } from './components/ToolCard';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-logo">
            <span className="app-logo__icon">🧰</span>
            <span className="app-logo__name">BeginnersToolBox</span>
          </div>
          <p className="app-tagline">Simple, browser-based tools for everyday tasks.</p>
        </div>
      </header>

      <main className="app-main">
        <section className="tools-section">
          <h2 className="tools-section__title">All Tools</h2>
          <p className="tools-section__sub">{TOOLS.length} tools · More coming soon</p>
          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
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
