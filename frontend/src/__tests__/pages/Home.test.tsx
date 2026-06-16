import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Home } from '../../pages/Home';

vi.mock('../../components/home/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero</div>
}));
vi.mock('../../components/home/FeaturesSection', () => ({
  FeaturesSection: () => <div data-testid="features-section">Features</div>
}));
vi.mock('../../components/common/SEO', () => ({
  SEO: () => <div data-testid="seo-component">SEO</div>
}));

describe('Home Page', () => {
  it('shouldRenderCoreSections', () => {
    render(<Home />);
    
    expect(screen.getByTestId('seo-component')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
  });
});
