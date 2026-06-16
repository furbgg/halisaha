import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BookingSuccess } from '../../pages/BookingSuccess';

const mockNavigate = vi.fn();
const mockLocationDescriptor = {
  pathname: '/reservierung/success',
  state: {
    bookingId: 'RH-SUCCESS-123',
    selectedField: { name: 'Main Field', type: 'FOOTBALL' },
    dateTime: {
        startTime: '2025-10-10T10:00:00.000Z',
        endTime: '2025-10-10T11:00:00.000Z',
        durationMinutes: 60,
    },
    price: { total: 60, status: 'Bezahlt' },
  }
};

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
        useLocation: () => mockLocationDescriptor,
    };
});

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

vi.mock('react-qr-code', () => ({
  default: () => <div data-testid="qr-code">QR Code</div>
}));

describe('BookingSuccess Page', () => {
  it('shouldRenderSuccessMessageAndDetails', () => {
    render(
      <MemoryRouter>
        <BookingSuccess />
      </MemoryRouter>
    );

    expect(screen.getByText(/Buchung Bestätigt/i)).toBeInTheDocument();
    expect(screen.getByText(/#RH-SUCCESS-123/i)).toBeInTheDocument();
    expect(screen.getByText(/Main Field/i)).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });
});
