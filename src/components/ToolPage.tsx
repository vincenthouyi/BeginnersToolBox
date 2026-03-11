import type { ToolMeta } from '../registry/tools';
import './ToolPage.css';

interface Props {
  tool: ToolMeta;
  onBack: () => void;
  children: React.ReactNode;
}

export function ToolPage({ tool, onBack, children }: Props) {
  return (
    <div className="tool-page">
      <div className="tool-page__header">
        <button className="tool-page__back" onClick={onBack}>
          ← Back
        </button>
        <div className="tool-page__title-row">
          <span className="tool-page__icon" aria-hidden="true">{tool.icon}</span>
          <h1 className="tool-page__title">{tool.name}</h1>
        </div>
        <p className="tool-page__desc">{tool.description}</p>
      </div>
      <div className="tool-page__body">{children}</div>
      <p className="tool-page__hint">Inputs are saved in your browser.</p>
    </div>
  );
}
