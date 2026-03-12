import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../../registry/tools';
import { clearAll, clearTool, toolsWithStorage } from '../../lib/localStorageAdmin';
import './SettingsPage.css';

function confirmAndRun(message: string, action: () => void): void {
  if (window.confirm(message)) {
    action();
    window.location.reload();
  }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const storageToolIds = toolsWithStorage();
  const storageTools = storageToolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as typeof TOOLS;

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <button className="settings-page__back" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1 className="settings-page__title">Settings</h1>
        <p className="settings-page__desc">Manage data saved in your browser.</p>
      </div>

      <section className="settings-section">
        <h2 className="settings-section__heading">All saved data</h2>
        <p className="settings-section__note">
          Clears inputs and preferences saved by every tool in this app. This does not affect
          other websites or browser data.
        </p>
        <button
          className="settings-btn settings-btn--danger"
          onClick={() =>
            confirmAndRun(
              'Clear all saved data for every tool? This cannot be undone.',
              clearAll,
            )
          }
        >
          Clear all saved data
        </button>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__heading">Per-tool data</h2>
        <ul className="settings-tool-list">
          {storageTools.map((tool) => (
            <li key={tool.id} className="settings-tool-item">
              <span className="settings-tool-item__icon" aria-hidden="true">
                {tool.icon}
              </span>
              <span className="settings-tool-item__name">{tool.name}</span>
              <button
                className="settings-btn settings-btn--sm"
                onClick={() =>
                  confirmAndRun(
                    `Clear saved data for "${tool.name}"? This cannot be undone.`,
                    () => clearTool(tool.id),
                  )
                }
              >
                Clear saved data
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
