import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Login } from '../../pages/Login';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ state: { from: '/some-page' } }),
    };
});

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  it('renders login form inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/E-Mail Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Wrong password' } }
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Passwort/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(screen.getByText(/Wrong password/i)).toBeInTheDocument();
    });
  });

  it('progresses to TOTP input if required', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { data: { totpRequired: true } }
    } as any);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Passwort/i), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/2FA-Code/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Verifizieren/i })).toBeInTheDocument();
    });
  });

  it('completes login and navigates to the from-url', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { data: { accessToken: 'token123', name: 'John Doe', role: 'ADMIN' } }
    } as any);

    renderLogin();

    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/Passwort/i), { target: { value: 'correctpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Anmelden/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/some-page', { replace: true });
    });
  });
});
