import {
  COMPANY_LEGAL_NAME,
  COMPANY_SLOGAN,
  CONTACT_PHONES,
  ADDRESS_STREET,
  ADDRESS_CITY,
  ADDRESS_ZIP,
  ADDRESS_COUNTRY,
  ADDRESS_COORDINATES,
} from '../config/brand';
import { SEO_CITY, SEO_KEYWORDS, SEO_NEARBY_CITIES, SEO_REGION } from '../config/seo.generated';

export const getSportsLocationJsonLd = (siteUrl: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': ['SportsActivityLocation', 'LocalBusiness'],
    name: COMPANY_LEGAL_NAME,
    image: `${siteUrl}/soccer.png`,
    description: COMPANY_SLOGAN,
    '@id': `${siteUrl}/#sports_facility`,
    url: siteUrl,
    telephone: CONTACT_PHONES[0] || '',
    priceRange: 'EUR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ADDRESS_STREET,
      addressLocality: ADDRESS_CITY,
      postalCode: ADDRESS_ZIP,
      addressCountry: ADDRESS_COUNTRY,
    },
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: SEO_REGION,
      },
      {
        '@type': 'City',
        name: SEO_CITY || ADDRESS_CITY,
      },
      ...SEO_NEARBY_CITIES.map((city) => ({
        '@type': 'City',
        name: city,
      })),
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: ADDRESS_COORDINATES.lat,
      longitude: ADDRESS_COORDINATES.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '10:00',
        closes: '23:00',
      },
    ],
    keywords: SEO_KEYWORDS,
  };
};
