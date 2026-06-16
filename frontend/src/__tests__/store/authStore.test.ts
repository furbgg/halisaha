import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    localStorage.clear();
  });

  it('initialState_shouldBeUnauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('setTokens_shouldUpdateAccessToken', () => {
    useAuthStore.getState().setTokens('access-token');
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
  });

  it('setUser_shouldUpdateUserInfo', () => {
    const mockUser = {
      displayId: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    };

    useAuthStore.getState().setUser(mockUser);
    
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it('setUser_shouldSetIsAdminTrue_whenRoleIsAdmin', () => {
    const mockUser = {
      displayId: '123',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN' as const,
    };

    useAuthStore.getState().setUser(mockUser);
    
    const state = useAuthStore.getState();
    expect(state.isAdmin).toBe(true);
  });

  it('login_shouldSetAllAuthData', () => {
    const mockUser = {
      displayId: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER' as const,
    };

    useAuthStore.getState().login('access-token', mockUser);
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-token');
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it('logout_shouldClearAllAuthState', () => {
    useAuthStore.setState({
      accessToken: 'access-token',
      user: {
        displayId: '123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
      },
      isAuthenticated: true,
      isAdmin: false,
    });

    useAuthStore.getState().logout();
    
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });
});
