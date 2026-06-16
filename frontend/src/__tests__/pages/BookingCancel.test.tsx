import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BookingCancel } from '../../pages/BookingCancel';

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

describe('BookingCancel Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        data: {
          id: 1,
          confirmationCode: 'RH-CANCEL-TEST',
          startTime: '2025-10-10T10:00:00.000Z',
          endTime: '2025-10-10T11:00:00.000Z',
          field: { name: 'Main Field' },
        }
      }
    } as any);
    vi.mocked(api.delete).mockResolvedValue({ data: { message: 'Success' } } as any);
  });

  const renderCancel = () => {
    return render(
      <MemoryRouter initialEntries={['/reservierung/stornieren/RH-CANCEL-TEST']}>
        <Routes>
          <Route path="/reservierung/stornieren/:id" element={<BookingCancel />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shouldRenderCancelConfirmationPrompt', async () => {
    renderCancel();
    await waitFor(() => {
      expect(screen.getByText(/Möchtest du wirklich stornieren/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/RH-CANCEL-TEST/i)).toBeInTheDocument();
  });

  it('shouldNavigateBackIfNotCancelling', async () => {
    renderCancel();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /DOCH NICHT STORNIEREN/i })).toBeInTheDocument();
    });

    const backBtn = screen.getByRole('button', { name: /DOCH NICHT STORNIEREN/i });
    fireEvent.click(backBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/reservierung/verwalten/RH-CANCEL-TEST');
  });

  it('shouldShowSuccessModalAfterCancellation', async () => {
    renderCancel();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /JETZT KOSTENPFLICHTIG STORNIEREN/i })).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole('button', { name: /JETZT KOSTENPFLICHTIG STORNIEREN/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
        expect(screen.getByText(/wurde erfolgreich storniert/i)).toBeInTheDocument();
        expect(screen.getByText(/ZURÜCK ZUR STARTSEITE/i)).toBeInTheDocument();
    }, { timeout: 1500 });

    const homeBtn = screen.getByRole('button', { name: /ZURÜCK ZUR STARTSEITE/i });
    fireEvent.click(homeBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
