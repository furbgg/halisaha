import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BookingManage } from '../../pages/BookingManage';

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

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
    };
});

describe('BookingManage Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderManage = (initialEntries = ['/reservierung/verwalten']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/reservierung/verwalten" element={<BookingManage />} />
          <Route path="/reservierung/verwalten/:id" element={<BookingManage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shouldRenderFormInputs', () => {
    renderManage();
    expect(screen.getByText(/Deine Buchung verwalten/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Buchungs-ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail-Adresse/i)).toBeInTheDocument();
  });

  it('shouldPreFillIdFromUrlParameters', () => {
    renderManage(['/reservierung/verwalten/RH-1234']);
    const idInput = screen.getByLabelText(/Buchungs-ID/i);
    expect(idInput).toHaveValue('RH-1234');
  });

  it('shouldNavigateOnSubmit', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: {
          confirmationCode: 'RH-TEST',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
        }
      }
    });

    renderManage();

    const idInput = screen.getByLabelText(/Buchungs-ID/i);
    const emailInput = screen.getByLabelText(/E-Mail-Adresse/i);

    fireEvent.change(idInput, { target: { value: 'RH-TEST' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /BUCHUNG FINDEN/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/reservierung/verwalten/RH-TEST', expect.any(Object));
    });
  });
});
