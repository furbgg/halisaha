import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../../services/adminService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getReservations_shouldFetchWithPagination', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await adminService.getReservations('2025-01-01', '2025-01-31');

    expect(api.get).toHaveBeenCalledWith('/admin/reservations', {
      params: { from: '2025-01-01', to: '2025-01-31' }
    });
  });

  it('cancelReservation_shouldDeleteById', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await adminService.cancelReservation(123);

    expect(api.delete).toHaveBeenCalledWith('/admin/reservations/123');
  });

  it('modifyReservation_shouldPutData', async () => {
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });
    const modifyData = { startTime: '2025-01-01T10:00:00', durationMinutes: 60 };

    await adminService.modifyReservation(123, modifyData);

    expect(api.put).toHaveBeenCalledWith('/admin/reservations/123', modifyData);
  });

  it('getStats_shouldFetchDashboardStats', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await adminService.getDashboard();

    expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('getEquipment_shouldFetchEquipmentList', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await adminService.getEquipment();

    expect(api.get).toHaveBeenCalledWith('/admin/equipment');
  });
});
