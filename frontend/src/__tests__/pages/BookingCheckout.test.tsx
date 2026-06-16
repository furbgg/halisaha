import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BookingCheckout } from '../../pages/BookingCheckout';

vi.mock('../../services/api', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };
  return { default: mockApi };
});

import api from '../../services/api';

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: any) => children,
  PaymentElement: () => null,
  useStripe: () => null,
  useElements: () => null,
}));

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn().mockResolvedValue(null),
}));

const mockNavigate = vi.fn();
const mockLocationDescriptor = {
  pathname: '/reservierung/checkout',
  state: {
    selectedField: { id: 1, name: 'Main Field', type: 'FOOTBALL', hourlyPrice: 60 },
    selectedSlot: { date: '2025-10-10', startTime: '2025-10-10T10:00:00.000Z' },
    durationMinutes: 60,
    calculatedPrice: 60,
    userParams: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '1234567'
    },
    sessionId: 'test-session-id'
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

describe('BookingCheckout Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { data: { holdDurationMinutes: 5 } } } as any);
  });

  it('shouldRenderPaymentMethodSelection', async () => {
    render(
      <MemoryRouter>
        <BookingCheckout />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Zahlungsart wählen').length).toBeGreaterThan(0);
    expect(screen.getByText('Kreditkarte, Google Pay, Apple Pay')).toBeInTheDocument();
  });

  it('shouldHandlePaymentSubmission_andNavigateToSuccess', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: {
        data: { confirmationCode: 'BOOK-123', totalPrice: 62.5 }
      }
    });

    render(
      <MemoryRouter>
        <BookingCheckout />
      </MemoryRouter>
    );

    const onSiteLabel = screen.getByText('Vor Ort bezahlen');
    fireEvent.click(onSiteLabel);

    const privacyCheckbox = screen.getByRole('checkbox', { name: /akzeptiere/i });
    fireEvent.click(privacyCheckbox);

    const payButton = screen.getByRole('button', { name: /Jetzt buchen/i });
    fireEvent.click(payButton);

    expect(screen.getAllByText(/wird verarbeitet|Buchung wird erstellt/i).length).toBeGreaterThan(0);

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/reservations', expect.any(Object));
    }, { timeout: 4000 });
  });
});
