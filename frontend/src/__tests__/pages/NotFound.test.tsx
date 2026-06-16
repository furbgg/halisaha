import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { NotFound } from '../../pages/NotFound';

describe('NotFound Page', () => {
  it('shouldRender404Message', () => {
    render(
      <HelmetProvider>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </HelmetProvider>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/Diese Seite existiert leider nicht/i)).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: /ZURÜCK ZUR STARTSEITE/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /JETZT BUCHEN/i })).toHaveAttribute('href', '/reservierung');
  });
});
