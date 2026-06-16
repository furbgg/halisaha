import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HoldTimer } from '../../components/common/HoldTimer';

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

describe('HoldTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shouldShowRemainingTime', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: { holdDurationMinutes: 5 } }
    });

    render(
      <MemoryRouter>
        <HoldTimer />
      </MemoryRouter>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText(/5:00/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(screen.getByText(/4:59/i)).toBeInTheDocument();

    expect(screen.getByText(/4:59/i)).toBeInTheDocument();
  });

  it('shouldCallOnExpire_whenTimerReachesZero', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { data: { holdDurationMinutes: 1 } }
    });

    render(
      <MemoryRouter>
        <HoldTimer />
      </MemoryRouter>
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText(/1:00/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/reservierung', {
      replace: true,
      state: { holdExpired: true }
    });
  });
});
