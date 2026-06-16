import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { COMPANY_NAME, SITE_URL } from '../../config/brand';
import { SEO_DESCRIPTION, SEO_KEYWORDS } from '../../config/seo.generated';
import { getSportsLocationJsonLd } from '../../utils/structuredData';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export const SEO = ({
  title = 'Online Reservierung',
  description = SEO_DESCRIPTION,
  keywords = SEO_KEYWORDS,
  image = '/soccer.png',
  type = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const location = useLocation();
  const canonicalUrl = `${SITE_URL}${location.pathname}`;
  const fullTitle = `${title} | ${COMPANY_NAME}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  const baseSchema = getSportsLocationJsonLd(SITE_URL);
  const extraSchemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  const schemas = noindex ? [] : [baseSchema, ...extraSchemas];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={COMPANY_NAME} />
      <meta property="og:locale" content="de_AT" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={COMPANY_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow, noarchive" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {schemas.map((item, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
};
