import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import React from 'react';
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: any) => React.createElement(React.Fragment, null, children),
  HelmetProvider: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

import de from '../i18n/de.json';

const getI18nStr = (key: string, data: any): any => 
  key.split('.').reduce((o: any, i: string) => (o ? o[i] : undefined), data);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => {
      const val = getI18nStr(key, de);
      if (val) return val;
      return typeof defaultValue === 'string' ? defaultValue : key;
    },
    i18n: { changeLanguage: vi.fn(), language: 'de' },
  }),
  Trans: ({ i18nKey, children }: { i18nKey: string; children?: React.ReactNode }) => {
    const val = getI18nStr(i18nKey, de);
    if (val) return val;
    return children;
  },
}));
