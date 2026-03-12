import type { ToolMeta } from '../registry/tools';
import { clearTool, getToolKeys } from '../lib/localStorageAdmin';
import './ToolPage.css';

interface Props {
  tool: ToolMeta;
  onBack: () => void;
  children: React.ReactNode;
}

export function ToolPage({ tool, onBack, children }: Props) {
  const hasSavedData = getToolKeys(tool.id).length > 0;

  function handleReset() {
    if (window.confirm(`Reset "${tool.name}"? Saved inputs and settings will be cleared.`)) {
      clearTool(tool.id);
      window.location.reload();
    }
  }

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
      <div className="tool-page__footer">
        <p className="tool-page__hint">Inputs are saved in your browser.</p>
        {hasSavedData && (
          <button className="tool-page__reset" onClick={handleReset}>
            Reset this tool
          </button>
        )}
      </div>
    </div>
  );
}
