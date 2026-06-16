import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FAQ } from '../../pages/FAQ';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

describe('FAQ Page', () => {
  it('shouldRenderQuestionsAndMap', () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>
    );

    const question = screen.getByText(/Kann man auch ohne Reservierung spielen/i);
    expect(question).toBeInTheDocument();

    const answer = screen.getByText(/Spontanes Spielen ist möglich, wenn ein Platz frei ist/i);
    expect(answer).toBeInTheDocument();
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('shouldToggleAccordionOnClick', () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>
    );

    const question = screen.getByText(/Kann man auch ohne Reservierung spielen/i);
    const container = question.closest('div[class*="cursor-pointer"]');
    
    const toggleableDiv = container?.querySelector('.overflow-hidden');
    expect(toggleableDiv).toHaveClass('max-h-0');

    fireEvent.click(container!);
    
    expect(toggleableDiv).toHaveClass('max-h-96');
  });
});
