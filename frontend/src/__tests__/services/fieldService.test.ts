import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fieldService } from '../../services/fieldService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('fieldService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getFields_shouldFetchAllFields', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await fieldService.getAll();

    expect(api.get).toHaveBeenCalledWith('/fields');
  });

  it('getFieldById_shouldFetchSingleField', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await fieldService.getById(5);

    expect(api.get).toHaveBeenCalledWith('/fields/5');
  });

  it('getAvailableSlots_shouldFetchWithDateParam', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await fieldService.getAvailability(5, '2025-01-01', 90);

    expect(api.get).toHaveBeenCalledWith('/fields/5/availability', {
      params: { date: '2025-01-01', duration: 90 }
    });
  });
});
