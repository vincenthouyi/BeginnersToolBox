import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOLS } from '../../registry/tools';
import { clearAll, clearTool, toolsWithStorage } from '../../lib/localStorageAdmin';
import {
  applyThemePreference,
  getThemePreference,
  setThemePreference,
  type ThemePreference,
} from '../../lib/theme';
import './SettingsPage.css';

function confirmAndRun(message: string, action: () => void): void {
  if (window.confirm(message)) {
    action();
    window.location.reload();
  }
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [themePref, setThemePrefState] = useState<ThemePreference>(() => getThemePreference());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'btb:theme') {
        setThemePrefState(getThemePreference());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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
        <h2 className="settings-section__heading">Theme</h2>
        <p className="settings-section__note">Choose a theme. “System” follows your device setting.</p>

        <div className="settings-theme">
          <label className="settings-theme__option">
            <input
              type="radio"
              name="theme"
              value="system"
              checked={themePref === 'system'}
              onChange={() => {
                setThemePrefState('system');
                setThemePreference('system');
                applyThemePreference('system');
              }}
            />
            <span>System</span>
          </label>

          <label className="settings-theme__option">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={themePref === 'light'}
              onChange={() => {
                setThemePrefState('light');
                setThemePreference('light');
                applyThemePreference('light');
              }}
            />
            <span>Light</span>
          </label>

          <label className="settings-theme__option">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={themePref === 'dark'}
              onChange={() => {
                setThemePrefState('dark');
                setThemePreference('dark');
                applyThemePreference('dark');
              }}
            />
            <span>Dark</span>
          </label>
        </div>
      </section>

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
