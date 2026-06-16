import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Contact } from '../../pages/Contact';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  }
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldRenderContactFormAndDetails', () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    expect(screen.getByText(/Kontaktieren/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Betreff/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ihre Nachricht/i)).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('shouldSubmitContactFormAndShowSuccess', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { success: true } });

    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Betreff/i), { target: { value: 'Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Ihre Nachricht/i), { target: { value: 'Hello world.' } });

    const submitBtn = screen.getByRole('button', { name: /Nachricht Senden/i });
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    
    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/contact', {
           name: 'Test User',
           email: 'test@example.com',
           subject: 'Inquiry',
           message: 'Hello world.'
        });
        expect(screen.getByText(/Vielen Dank für Ihre Nachricht/i)).toBeInTheDocument();
    });
  });

  it('shouldShowErrorOnSubmissionFailure', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
        response: { data: { message: 'Server error' } }
    });

    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Betreff/i), { target: { value: 'Inquiry' } });
    fireEvent.change(screen.getByLabelText(/Ihre Nachricht/i), { target: { value: 'Hello world.' } });
    
    const submitBtn = screen.getByRole('button', { name: /Nachricht Senden/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
        expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });
});
