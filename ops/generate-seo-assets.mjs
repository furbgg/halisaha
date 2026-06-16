import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const brandConfigPath = path.join(projectRoot, 'brand.config.json');
const robotsPath = path.join(projectRoot, 'frontend', 'public', 'robots.txt');
const sitemapPath = path.join(projectRoot, 'frontend', 'public', 'sitemap.xml');
const seoGeneratedPath = path.join(projectRoot, 'frontend', 'src', 'config', 'seo.generated.ts');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }

    const eqIndex = token.indexOf('=');
    if (eqIndex > -1) {
      const key = token.slice(2, eqIndex);
      const value = token.slice(eqIndex + 1);
      args[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function normalizeWebsiteUrl(rawUrl) {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned) {
    return 'https://example.com';
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/\/+$/, '');
  }
  return `https://${cleaned}`.replace(/\/+$/, '');
}

function hostFromUrl(siteUrl) {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  }
}

function parseSports(input) {
  if (!input) {
    return ['Fussball', 'Bubble Soccer'];
  }
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseNearbyCities(input) {
  if (!input) {
    return [];
  }
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sanitizeTsString(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function buildSeoKeywords(companyName, city, region, sports, nearbyCities) {
  const raw = [
    companyName,
    city,
    region,
    ...nearbyCities,
    ...sports,
    'halle mieten',
    'reservierung',
  ];

  const unique = [];
  for (const item of raw) {
    const normalized = item.trim().toLowerCase();
    if (!normalized || unique.includes(normalized)) {
      continue;
    }
    unique.push(normalized);
  }
  return unique.join(', ');
}

function buildSeoDescription(companyName, city, pitchCount, sports) {
  const sportsText = sports.length > 1
    ? `${sports.slice(0, -1).join(', ')} und ${sports[sports.length - 1]}`
    : sports[0];
  return `${companyName} in ${city}: ${pitchCount} Plaetze fuer ${sportsText} online reservieren.`;
}

function buildRobotsTxt({ siteHost, siteUrl, adminPortalPath }) {
  const adminPath = adminPortalPath.startsWith('/') ? adminPortalPath : `/${adminPortalPath}`;
  const adminPathWithSlash = adminPath.endsWith('/') ? adminPath : `${adminPath}/`;

  return [
    'User-agent: *',
    'Allow: /',
    'Allow: /reservierung',
    'Allow: /turniere',
    'Allow: /kontakt',
    'Allow: /faq',
    'Allow: /impressum',
    'Allow: /datenschutz',
    'Allow: /agb',
    'Allow: /rueckerstattung',
    'Allow: /barrierefreiheit',
    '',
    'Disallow: /admin/',
    `Disallow: ${adminPath}`,
    `Disallow: ${adminPathWithSlash}`,
    'Disallow: /konto/',
    'Disallow: /reservierung/verwalten/',
    'Disallow: /reservierung/ticket/',
    'Disallow: /reservierung/checkout/',
    'Disallow: /reservierung/success/',
    'Disallow: /reservierung/failure/',
    '',
    `Host: ${siteHost}`,
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

function buildSitemapXml({ siteUrl, lastModDate }) {
  const pages = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/reservierung', changefreq: 'daily', priority: '0.9' },
    { path: '/turniere', changefreq: 'weekly', priority: '0.8' },
    { path: '/turniere/anmeldung', changefreq: 'monthly', priority: '0.7' },
    { path: '/kontakt', changefreq: 'monthly', priority: '0.7' },
    { path: '/faq', changefreq: 'monthly', priority: '0.7' },
    { path: '/impressum', changefreq: 'yearly', priority: '0.3' },
    { path: '/datenschutz', changefreq: 'yearly', priority: '0.3' },
    { path: '/agb', changefreq: 'yearly', priority: '0.3' },
    { path: '/rueckerstattung', changefreq: 'yearly', priority: '0.3' },
    { path: '/barrierefreiheit', changefreq: 'yearly', priority: '0.3' },
  ];

  const urlNodes = pages
    .map((page) => {
      return [
        '  <url>',
        `    <loc>${siteUrl}${page.path}</loc>`,
        `    <lastmod>${lastModDate}</lastmod>`,
        `    <changefreq>${page.changefreq}</changefreq>`,
        `    <priority>${page.priority}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
    '  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
    '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"',
    '>',
    urlNodes,
    '</urlset>',
    '',
  ].join('\n');
}

function buildSeoGeneratedTs({
  city,
  region,
  nearbyCities,
  sports,
  pitchCount,
  seoDescription,
  seoKeywords,
}) {
  const nearbyCitiesLiteral = nearbyCities
    .map((item) => `'${sanitizeTsString(item)}'`)
    .join(', ');
  const sportsLiteral = sports
    .map((sport) => `'${sanitizeTsString(sport)}'`)
    .join(', ');

  return [
    '/**',
    ' * Auto-generated SEO defaults.',
    ' * Generated via: node ops/generate-seo-assets.mjs',
    ' */',
    '',
    `export const SEO_CITY = '${sanitizeTsString(city)}';`,
    `export const SEO_REGION = '${sanitizeTsString(region)}';`,
    `export const SEO_NEARBY_CITIES = [${nearbyCitiesLiteral}] as const;`,
    `export const SEO_SPORTS = [${sportsLiteral}] as const;`,
    `export const SEO_PITCH_COUNT = ${pitchCount};`,
    '',
    `export const SEO_DESCRIPTION = '${sanitizeTsString(seoDescription)}';`,
    `export const SEO_KEYWORDS = '${sanitizeTsString(seoKeywords)}';`,
    '',
  ].join('\n');
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const brandRaw = await fs.readFile(brandConfigPath, 'utf8');
  const brand = JSON.parse(brandRaw.replace(/^\uFEFF/, ''));

  const siteUrl = normalizeWebsiteUrl(args.domain || brand?.contact?.website || '');
  const siteHost = hostFromUrl(siteUrl);
  const city = (args.city || brand?.address?.city || 'Linz').trim();
  const region = (args.region || 'Oberoesterreich').trim();
  const nearbyCities = parseNearbyCities(args.nearbyCities);
  const sports = parseSports(args.sports);
  const pitchCount = Number.parseInt(args.pitches || '2', 10);
  const safePitchCount = Number.isNaN(pitchCount) ? 2 : Math.max(1, pitchCount);
  const companyName = (brand?.company?.name || 'Sports Arena').trim();
  const adminPortalPath = args.adminPath || brand?.branding?.adminPortalPath || '/admin';

  const seoDescription = buildSeoDescription(companyName, city, safePitchCount, sports);
  const seoKeywords = buildSeoKeywords(companyName, city, region, sports, nearbyCities);
  const lastModDate = new Date().toISOString().slice(0, 10);

  const robotsTxt = buildRobotsTxt({ siteHost, siteUrl, adminPortalPath });
  const sitemapXml = buildSitemapXml({ siteUrl, lastModDate });
  const seoGeneratedTs = buildSeoGeneratedTs({
    city,
    region,
    nearbyCities,
    sports,
    pitchCount: safePitchCount,
    seoDescription,
    seoKeywords,
  });

  await fs.writeFile(robotsPath, robotsTxt, 'utf8');
  await fs.writeFile(sitemapPath, sitemapXml, 'utf8');
  await fs.writeFile(seoGeneratedPath, seoGeneratedTs, 'utf8');

  console.log('SEO assets generated successfully.');
  console.log(`- Site URL: ${siteUrl}`);
  console.log(`- City/Region: ${city} / ${region}`);
  if (nearbyCities.length > 0) {
    console.log(`- Nearby cities: ${nearbyCities.join(', ')}`);
  }
  console.log(`- Sports: ${sports.join(', ')}`);
  console.log(`- Pitch count: ${safePitchCount}`);
}

run().catch((error) => {
  console.error('Failed to generate SEO assets:', error);
  process.exit(1);
});
