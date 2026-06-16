const fs = require('fs');
const path = require('path');

const sPath = path.join(process.cwd(), 'src', 'test', 'setup.ts');
let stxt = fs.readFileSync(sPath, 'utf8');

stxt = stxt.replace(/vi\.mock\('react-i18next'.*/s, `import de from '../i18n/de.json';

const getI18nStr = (key, data) => key.split('.').reduce((o, i) => (o ? o[i] : undefined), data);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => {
      const val = getI18nStr(key, de);
      if (val) return val;
      return typeof defaultValue === 'string' ? defaultValue : key;
    },
    i18n: { changeLanguage: vi.fn(), language: 'de' },
  }),
  Trans: ({ children }) => children,
}));
`);

fs.writeFileSync(sPath, stxt);

console.log('Fixed react-i18next mock');
