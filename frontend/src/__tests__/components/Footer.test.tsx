import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../../components/layout/Footer';

describe('Footer', () => {
  const renderFooter = () => {
    return render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
  };

  it('shouldRenderAllFooterLinks', () => {
    renderFooter();
    
    expect(screen.getByText(/Rückerstattungsrichtlinien/i)).toBeInTheDocument();
    expect(screen.getByText(/Datenschutz/i)).toBeInTheDocument();
    expect(screen.getByText(/Impressum/i)).toBeInTheDocument();
    expect(screen.getByText(/Barrierefreiheit/i)).toBeInTheDocument();
    expect(screen.getByText(/Kontakt/i)).toBeInTheDocument();
    expect(screen.getByText(/AGB/i)).toBeInTheDocument();
    expect(screen.getByText(/FAQ/i)).toBeInTheDocument();
  });

  it('shouldRenderImpressumLink', () => {
    renderFooter();
    const impressumLink = screen.getByText(/Impressum/i);
    expect(impressumLink.closest('a')).toHaveAttribute('href', '/impressum');
  });

  it('shouldRenderDatenschutzLink', () => {
    renderFooter();
    const datenschutzLink = screen.getByText(/Datenschutz/i);
    expect(datenschutzLink.closest('a')).toHaveAttribute('href', '/datenschutz');
  });

  it('shouldRenderCopyright', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`, 'i'))).toBeInTheDocument();
  });
});
