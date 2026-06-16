import { describe, it, expect, vi, beforeEach } from 'vitest';
import { settingsService } from '../../services/settingsService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll_shouldFetchSettings', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await settingsService.getAll();

    expect(api.get).toHaveBeenCalledWith('/admin/settings');
  });

  it('update_shouldPutSetting', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    await settingsService.update('HAPPY_HOUR_ACTIVE', 'true');

    expect(api.put).toHaveBeenCalledWith('/admin/settings/HAPPY_HOUR_ACTIVE', { value: 'true' });
  });
});
