import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { SEO } from './SEO';
import { COMPANY_NAME, ADDRESS_CITY } from '../../config/brand';
import { SEO_PITCH_COUNT, SEO_REGION, SEO_SPORTS } from '../../config/seo.generated';

type RouteMeta = {
  title: string;
  description: string;
  keywords: string;
  noindex: boolean;
};

const STATIC_ROUTE_META: Record<string, Omit<RouteMeta, 'noindex'>> = {
  '/reservierung': {
    title: 'Platz reservieren',
    description: `Buche ${SEO_PITCH_COUNT} Plaetze bei ${COMPANY_NAME} in wenigen Schritten online.`,
    keywords: 'platz reservieren, fussballplatz buchen, halle buchen, online reservierung',
  },
  '/turniere': {
    title: 'Turniere',
    description: `Alle kommenden Turniere bei ${COMPANY_NAME} im Ueberblick.`,
    keywords: 'turniere, fussball turnier, team anmelden, amateur turnier',
  },
  '/turniere/anmeldung': {
    title: 'Turnier Anmeldung',
    description: `Melde dein Team fuer das naechste Turnier bei ${COMPANY_NAME} an.`,
    keywords: 'turnier anmeldung, team registrierung, fussball event',
  },
  '/kontakt': {
    title: 'Kontakt',
    description: `Kontakt und Anfahrt zu ${COMPANY_NAME} in ${ADDRESS_CITY}, ${SEO_REGION}.`,
    keywords: 'kontakt, anfahrt, oeffnungszeiten, support',
  },
  '/faq': {
    title: 'FAQ',
    description: `Antworten auf haeufige Fragen zu ${SEO_SPORTS.join(', ')}, Buchung und Stornierung bei ${COMPANY_NAME}.`,
    keywords: 'faq, fragen, buchung hilfe, stornierung',
  },
  '/impressum': {
    title: 'Impressum',
    description: `Impressum und Unternehmensinformationen von ${COMPANY_NAME}.`,
    keywords: 'impressum, unternehmen, rechtliches',
  },
  '/datenschutz': {
    title: 'Datenschutz',
    description: `Datenschutzerklaerung von ${COMPANY_NAME} gemaess DSGVO.`,
    keywords: 'datenschutz, dsgvo, datenverarbeitung',
  },
  '/agb': {
    title: 'AGB',
    description: `Allgemeine Geschaeftsbedingungen fuer Buchungen bei ${COMPANY_NAME}.`,
    keywords: 'agb, buchungsbedingungen, zahlung, stornierung',
  },
  '/rueckerstattung': {
    title: 'Rueckerstattung',
    description: `Richtlinie fuer Stornierungen, Umbuchungen und Rueckerstattungen bei ${COMPANY_NAME}.`,
    keywords: 'rueckerstattung, stornierung, umbuchen, zahlung',
  },
  '/barrierefreiheit': {
    title: 'Barrierefreiheit',
    description: `Informationen zur digitalen Barrierefreiheit von ${COMPANY_NAME}.`,
    keywords: 'barrierefreiheit, accessibility, erklaerung',
  },
};

const INDEXABLE_PATHS = new Set(Object.keys(STATIC_ROUTE_META).concat(['/']));

const FORCED_NOINDEX_PREFIXES = [
  '/reservierung/details',
  '/reservierung/checkout',
  '/reservierung/success',
  '/reservierung/failure',
  '/reservierung/verwalten',
  '/reservierung/umbuchen',
  '/reservierung/stornieren',
  '/reservierung/ticket',
  '/reservierung/',
  '/konto',
  '/wartung',
  '/401',
  '/403',
  '/500',
  '/login',
  '/admin',
];

const PATHS_WITH_OWN_SEO = new Set(['/', '/401', '/403', '/500', '/wartung']);

function isForcedNoindex(pathname: string): boolean {
  return FORCED_NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function RouteSEO() {
  const location = useLocation();
  const pathname = location.pathname;

  if (PATHS_WITH_OWN_SEO.has(pathname)) {
    return null;
  }

  const meta = useMemo<RouteMeta>(() => {
    if (pathname in STATIC_ROUTE_META) {
      return { ...STATIC_ROUTE_META[pathname], noindex: false };
    }

    if (isForcedNoindex(pathname) || !INDEXABLE_PATHS.has(pathname)) {
      return {
        title: 'Seite',
        description: `${COMPANY_NAME} Buchungsplattform`,
        keywords: 'fussball, reservierung, halle, buchung',
        noindex: true,
      };
    }

    return {
      title: 'Seite',
      description: `${COMPANY_NAME} Buchungsplattform`,
      keywords: 'fussball, reservierung, halle, buchung',
      noindex: false,
    };
  }, [pathname]);

  return (
    <SEO
      title={meta.title}
      description={meta.description}
      keywords={meta.keywords}
      noindex={meta.noindex}
    />
  );
}
