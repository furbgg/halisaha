import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { useAuthStore } from '../../store/authStore';

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  })),
}));



describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderNavbar = (showLinks = true) => {
    return render(
      <MemoryRouter>
        <Navbar showLinks={showLinks} />
      </MemoryRouter>
    );
  };

  it('shouldRenderLogoAndBrandText', () => {
    renderNavbar();
    expect(screen.getAllByText(/SALAMANDA/i).length).toBeGreaterThan(0);
  });

  it('shouldShowNavigationLinks_whenShowLinksIsTrue', () => {
    renderNavbar(true);
    expect(screen.getAllByText(/Startseite/i).length).toBeGreaterThan(0);
  });

  it('shouldShowBookingCTA_whenShowLinksIsTrue', () => {
    renderNavbar();
    const buttons = screen.getAllByText(/Jetzt Buchen/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shouldOpenMobileMenu_onClick', () => {
    const { container } = renderNavbar();
    
    const menuIcon = screen.getByText('menu');
    fireEvent.click(menuIcon);
    
    const mobileLinks = screen.getAllByText(/Startseite/i);
    expect(mobileLinks.length).toBeGreaterThan(1);
  });
});
