/**
 * White-label brand configuration.
 * Values come from /brand.config.json and are consumed across the frontend.
 */

import brandConfig from '../../../brand.config.json';

export const COMPANY_NAME = brandConfig.company.name;
export const COMPANY_LEGAL_NAME = brandConfig.company.legalName;
export const COMPANY_LEGAL_FORM = brandConfig.company.legalForm;
export const COMPANY_OWNERS = brandConfig.company.owners;
export const COMPANY_SLOGAN = brandConfig.company.slogan;

export const CONTACT_EMAIL = brandConfig.contact.email;
export const CONTACT_PHONES = brandConfig.contact.phone;
export const CONTACT_WEBSITE = brandConfig.contact.website;
export const SITE_URL = normalizeWebsiteUrl(brandConfig.contact.website);

export const ADDRESS_STREET = brandConfig.address.street;
export const ADDRESS_ZIP = brandConfig.address.zip;
export const ADDRESS_CITY = brandConfig.address.city;
export const ADDRESS_COUNTRY = brandConfig.address.country;
export const ADDRESS_FULL = `${ADDRESS_STREET}, ${ADDRESS_ZIP} ${ADDRESS_CITY}`;
export const ADDRESS_GOOGLE_MAPS_URL = `https://www.google.com/maps/dir/?api=1&destination=${brandConfig.address.googleMapsQuery}`;
export const ADDRESS_COORDINATES = brandConfig.address.coordinates;
export const MAP_COORDINATES = ADDRESS_COORDINATES;

export const LEGAL_UID = brandConfig.legal.uidNumber;
export const LEGAL_COURT = brandConfig.legal.court;
export const LEGAL_JURISDICTION = brandConfig.legal.jurisdiction;
export const LEGAL_CHAMBER = brandConfig.legal.chamberMembership;

export const SOCIAL_INSTAGRAM = brandConfig.social.instagram;

export const PRIMARY_COLOR = brandConfig.branding.primaryColor;
export const ADMIN_PORTAL_PATH = brandConfig.branding.adminPortalPath;
export const LOGO_PATH = brandConfig.branding.logoPath;

export const pageTitle = (page: string) => `${page} - ${COMPANY_NAME}`;
export const mailtoLink = (subject?: string) =>
  `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

function normalizeWebsiteUrl(rawUrl: string): string {
  const cleaned = (rawUrl || '').trim();
  if (!cleaned) {
    return 'https://example.com';
  }
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned.replace(/\/+$/, '');
  }
  return `https://${cleaned}`.replace(/\/+$/, '');
}
