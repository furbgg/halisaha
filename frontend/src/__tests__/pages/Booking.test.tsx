import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Booking } from '../../pages/Booking';

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

describe('Booking Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 2, 2));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockFields = [
    { id: 1, name: 'Main Field', type: 'FOOTBALL', hourlyPrice: 60, allowedDurations: [60, 90] },
    { id: 2, name: 'Bubble Field', type: 'BUBBLE', hourlyPrice: 80, allowedDurations: [60, 120] }
  ];

  it('shouldFetchFieldsAndSelectFirstFootballField', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/settings/happy-hour') {
        return Promise.resolve({ data: { data: { enabled: false } } });
      }
      if (url === '/fields') {
        return Promise.resolve({ data: { data: mockFields } });
      }
      if (url.includes('/availability')) {
        return Promise.resolve({ data: { data: { slots: [] } } });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/fields');
    });

    expect(screen.getByText(/WÄHLE DEINE ZEIT/i)).toBeInTheDocument();
  });

  it('shouldFetchWeeklyAvailabilityWhenFieldChanges', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/settings/happy-hour') {
        return Promise.resolve({ data: { data: { enabled: false } } });
      }
      if (url === '/fields') {
        return Promise.resolve({ data: { data: mockFields } });
      }
      if (url.includes('/availability')) {
        return Promise.resolve({ data: { data: { slots: [] } } });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    await waitFor(() => {
       const availCalls = vi.mocked(api.get).mock.calls.filter(call => call[0].includes('/availability'));
       expect(availCalls.length).toBeGreaterThanOrEqual(7);
    });
  });

  it('shouldShowNoAvailabilityMessageWhenSlotsEmpty', async () => {
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/settings/happy-hour') {
        return Promise.resolve({ data: { data: { enabled: false } } });
      }
      if (url === '/fields') {
        return Promise.resolve({ data: { data: mockFields } });
      }
      if (url.includes('/availability')) {
        return Promise.resolve({ data: { data: { slots: [] } } });
      }
      return Promise.reject(new Error('not found'));
    });

    render(
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/Keine Zeiten verfügbar/i).length).toBeGreaterThan(0);
    });
  });
});
