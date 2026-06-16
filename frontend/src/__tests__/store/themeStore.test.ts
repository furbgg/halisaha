import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '../../store/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ isDark: false });
    document.body.className = '';
    localStorage.clear();
  });

  it('initialTheme_shouldBeFromState', () => {
    const state = useThemeStore.getState();
    expect(state.isDark).toBe(false);
  });

  it('toggleTheme_shouldSwitchBetweenLightAndDarkAndSetClass', () => {
    const store = useThemeStore.getState();
    
    store.toggle();
    let state = useThemeStore.getState();
    expect(state.isDark).toBe(true);
    expect(document.body.className).toBe('dark');

    state.toggle();
    state = useThemeStore.getState();
    expect(state.isDark).toBe(false);
    expect(document.body.className).toBe('light');
  });
});
