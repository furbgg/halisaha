import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { BookingFailure } from '../../pages/BookingFailure';

const mockNavigate = vi.fn();
const mockLocationDescriptor = {
  pathname: '/reservierung/failure',
  state: {
    bookingId: 'RH-FAIL-123',
    selectedField: { name: 'Main Field', type: 'FOOTBALL' },
    price: { total: 60 },
    errorReason: 'Payment denied by test bank.',
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

describe('BookingFailure Page', () => {
  it('shouldRenderFailureMessageAndReason', () => {
    render(
      <MemoryRouter>
        <BookingFailure />
      </MemoryRouter>
    );

    expect(screen.getByText(/Hoppla/i)).toBeInTheDocument();
    expect(screen.getByText(/#RH-FAIL-123/i)).toBeInTheDocument();
    expect(screen.getByText(/Payment denied by test bank/i)).toBeInTheDocument();
  });

  it('shouldNavigateToRetry', () => {
    render(
      <MemoryRouter>
        <BookingFailure />
      </MemoryRouter>
    );

    const retryBtn = screen.getByRole('button', { name: /ERNEUT VERSUCHEN/i });
    fireEvent.click(retryBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/reservierung');
  });
});
