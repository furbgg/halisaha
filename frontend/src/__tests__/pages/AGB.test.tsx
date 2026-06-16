import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AGB } from '../../pages/AGB';

describe('AGB Page', () => {
  it('shouldRenderAGBContent', () => {
    render(
      <MemoryRouter>
        <AGB />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Allgemeine/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Geschäftsbedingungen/i).length).toBeGreaterThan(0);
    
    expect(screen.getByText(/Geltungsbereich/i)).toBeInTheDocument();
    expect(screen.getByText(/Buchung & Vertragsabschluss/i)).toBeInTheDocument();
    expect(screen.getByText(/Stornierung & Rückerstattung/i)).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: /Zurück zur Startseite/i })).toHaveAttribute('href', '/');
    expect(screen.getByText(/Datenschutzerklärung/i)).toBeInTheDocument();
  });
});
