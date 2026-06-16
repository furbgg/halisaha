import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { SEO } from '../components/common/SEO';
import { useTranslation } from 'react-i18next';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO 
        title={t('home.seo.title')}
        description={t('home.seo.description')}
      />
      <HeroSection />
      <FeaturesSection />
    </>
  );
};
