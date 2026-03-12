export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'btb:theme';

export function getThemePreference(): ThemePreference {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

export function setThemePreference(pref: ThemePreference): void {
  localStorage.setItem(STORAGE_KEY, pref);
}

export function getEffectiveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref;
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  return mq?.matches ? 'dark' : 'light';
}

export function applyThemeClass(theme: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

export function applyThemePreference(pref: ThemePreference): void {
  applyThemeClass(getEffectiveTheme(pref));
}

export function initThemeSync(onEffectiveTheme?: (theme: 'light' | 'dark') => void): () => void {
  const update = () => {
    const pref = getThemePreference();
    const effective = getEffectiveTheme(pref);
    applyThemeClass(effective);
    onEffectiveTheme?.(effective);
  };

  update();

  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  const mqHandler = () => {
    if (getThemePreference() === 'system') update();
  };

  if (mq?.addEventListener) mq.addEventListener('change', mqHandler);
  else mq?.addListener?.(mqHandler);

  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) update();
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    if (mq?.removeEventListener) mq.removeEventListener('change', mqHandler);
    else mq?.removeListener?.(mqHandler);
    window.removeEventListener('storage', storageHandler);
  };
}
