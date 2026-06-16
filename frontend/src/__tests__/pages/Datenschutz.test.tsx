import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Datenschutz } from '../../pages/Datenschutz';

describe('Datenschutz Page', () => {
  it('shouldRenderDatenschutzContent', () => {
    render(
      <MemoryRouter>
        <Datenschutz />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Datenschutzerklärung/i).length).toBeGreaterThan(0);
    
    expect(screen.getByText(/Verantwortlicher/i)).toBeInTheDocument();
    expect(screen.getByText(/Erhebung und Verarbeitung von Daten/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cookies/i).length).toBeGreaterThan(0);
    
    expect(screen.getByRole('link', { name: /Zurück zur Startseite/i })).toHaveAttribute('href', '/');
  });
});
