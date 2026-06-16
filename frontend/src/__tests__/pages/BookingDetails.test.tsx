import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BookingDetails } from '../../pages/BookingDetails';
import { equipmentService } from '../../services/equipmentService';

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

vi.mock('../../services/equipmentService', () => ({
  equipmentService: {
    getRentable: vi.fn(),
    getAvailability: vi.fn(),
  }
}));

const mockNavigate = vi.fn();
const mockLocationDescriptor = {
  pathname: '/reservierung/details',
  state: {
    selectedField: { id: 1, name: 'Main Field', type: 'FOOTBALL', hourlyPrice: 60 },
    selectedSlot: { date: '2025-10-10', startTime: '2025-10-10T10:00:00.000Z' },
    durationMinutes: 60,
    calculatedPrice: 60,
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

describe('BookingDetails Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { data: { holdDurationMinutes: 5 } } } as any);
  });

  it('shouldRenderFormAndOrderSummary', async () => {
    vi.mocked(equipmentService.getRentable).mockResolvedValueOnce({ data: { data: [] } } as any);

    await act(async () => {
      render(
        <MemoryRouter>
          <BookingDetails />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Zusammenfassung')).toBeInTheDocument();

    expect(screen.getByText(/Main Field/i)).toBeInTheDocument();
  });

  it('shouldSubmitHoldAndNavigateToCheckout', async () => {
    vi.mocked(equipmentService.getRentable).mockResolvedValueOnce({ data: { data: [] } } as any);
    vi.mocked(api.post).mockResolvedValueOnce({ status: 201 });

    await act(async () => {
      render(
        <MemoryRouter>
          <BookingDetails />
        </MemoryRouter>
      );
    });

    fireEvent.change(screen.getByLabelText('Vorname'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Nachname'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('E-Mail-Adresse'), { target: { value: 'john@test.com' } });
    fireEvent.change(screen.getByLabelText('Telefonnummer'), { target: { value: '1234567' } });

    const nextButton = screen.getAllByRole('button', { name: /Weiter zur Zahlung/i })[0];
    await act(async () => {
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/reservations/hold', expect.any(Object));
        expect(mockNavigate).toHaveBeenCalledWith('/reservierung/checkout', expect.any(Object));
    });
  });
});
