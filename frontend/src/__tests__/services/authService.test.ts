import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../services/authService';
import api from '../../services/api';

vi.mock('../../services/api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    }
  };
});

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login_shouldPostCredentialsAndReturnTokens', async () => {
    const mockResponse = { data: { accessToken: 'access', refreshToken: 'refresh' } };
    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const response = await authService.login('test@test.com', 'password');

    expect(api.post).toHaveBeenCalledWith('/auth/login', { 
      email: 'test@test.com', 
      password: 'password', 
      totpCode: undefined 
    });
    expect(response).toEqual(mockResponse);
  });

  it('login_shouldSendTotpCode_whenProvided', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await authService.login('test@test.com', 'password', '123456');

    expect(api.post).toHaveBeenCalledWith('/auth/login', { 
      email: 'test@test.com', 
      password: 'password', 
      totpCode: '123456' 
    });
  });

  it('register_shouldPostUserData', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await authService.register('John Doe', 'john@test.com', '12345678', 'password');

    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'John Doe',
      email: 'john@test.com',
      phone: '12345678',
      password: 'password'
    });
  });

  it('refreshToken_shouldPostWithoutBody', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: { accessToken: 'new-access' } });

    await authService.refresh();

    expect(api.post).toHaveBeenCalledWith('/auth/refresh', {});
  });

  it('setup2fa_shouldGetSecretAndUri', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await authService.setup2fa();

    expect(api.get).toHaveBeenCalledWith('/auth/2fa/setup');
  });

  it('verify2fa_shouldPostCode', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await authService.verify2fa(123456);

    expect(api.post).toHaveBeenCalledWith('/auth/2fa/verify', { code: 123456 });
  });

  it('disable2fa_shouldDelete2fa', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await authService.disable2fa();

    expect(api.delete).toHaveBeenCalledWith('/auth/2fa');
  });
});
