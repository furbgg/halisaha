import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../../components/layout/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const renderWithRouter = (ui: React.ReactNode, initialEntry = '/protected') => {
    return render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/" element={<div data-testid="home-page">Home</div>} />
          <Route path="/403" element={<div data-testid="forbidden">403</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('shouldRenderChildren_whenAuthenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { role: 'USER' },
    } as any);

    renderWithRouter(
      <ProtectedRoute>
        <div data-testid="protected-content">Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shouldRedirectToHome_whenNotAuthenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
    } as any);

    renderWithRouter(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('shouldRedirectToHome_whenNotAuthenticatedAndAdminRequired', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: false,
    } as any);

    renderWithRouter(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('shouldRedirectToForbidden_whenWrongRole', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      user: { role: 'USER' },
    } as any);

    renderWithRouter(
      <ProtectedRoute requiredRole="ADMIN">
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('forbidden')).toBeInTheDocument();
  });

  it('shouldAllowAccess_whenAdminRoleRequired_andUserIsAdmin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      user: { role: 'ADMIN' },
    } as any);

    renderWithRouter(
      <ProtectedRoute requiredRole="ADMIN">
        <div data-testid="admin-content">Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
