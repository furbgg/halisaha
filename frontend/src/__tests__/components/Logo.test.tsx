import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';

describe('Logo', () => {
  const renderLogo = (props = {}) => {
    return render(
      <MemoryRouter>
        <Logo {...props} />
      </MemoryRouter>
    );
  };

  it('shouldRenderLargeLogoImage_whenVariantIsLarge', () => {
    renderLogo({ variant: 'large' });
    const img = screen.getByAltText(/Salamanda Soccer Arena Logo/i);
    expect(img).toBeInTheDocument();
  });

  it('shouldRenderTextLogo_whenVariantIsSmall', () => {
    renderLogo({ variant: 'small' });
    expect(screen.getByText('SALAMANDA')).toBeInTheDocument();
    expect(screen.getByText('SOCCER ARENA')).toBeInTheDocument();
  });

  it('shouldWrapInLink_whenWithLinkIsTrue', () => {
    renderLogo({ withLink: true });
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
    expect(link).toContainElement(screen.getByText('SALAMANDA'));
  });

  it('shouldNotWrapInLink_whenWithLinkIsFalse', () => {
    renderLogo({ withLink: false });
    
    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);
  });
});
