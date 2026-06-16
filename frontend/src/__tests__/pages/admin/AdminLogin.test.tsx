import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AdminLogin } from '../../../pages/admin/AdminLogin';
import { authService } from '../../../services/authService';

vi.mock('../../../services/authService', () => ({
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
    };
});

describe('AdminLogin Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldRenderEmailAndPasswordInputs', () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/E-Mail Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Passwort/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Anmelden/i })).toBeInTheDocument();
  });

  it('shouldHandleLoginError', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Invalid credentials' } }
    });

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Passwort/i), { target: { value: 'wrongpass' } });
    
    const loginBtn = screen.getByRole('button', { name: /Anmelden/i });
    fireEvent.click(loginBtn);

    await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shouldProceedToTotpIfRequired', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      data: { data: { totpRequired: true } }
    } as any);

    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'admin@test.com' } });
    fireEvent.change(screen.getByLabelText(/Passwort/i), { target: { value: 'correctpass' } });
    
    const loginBtn = screen.getByRole('button', { name: /Anmelden/i });
    fireEvent.click(loginBtn);

    await waitFor(() => {
        expect(screen.getByText(/Zwei-Faktor-Authentifizierung/i)).toBeInTheDocument();
    });
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
  });
});
