import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reservationService } from '../../services/reservationService';
import api from '../../services/api';

vi.mock('../../services/api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  };
});

describe('reservationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createReservation_shouldPostReservationData', async () => {
    const mockDataData: any = { fieldId: 1, startTime: '2025-01-01T10:00:00', duration: 60 };
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await reservationService.create(mockDataData);

    expect(api.post).toHaveBeenCalledWith('/reservations', mockDataData);
  });

  it('getReservation_shouldFetchByConfirmationCode', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await reservationService.getByCode('ABCDEFG');

    expect(api.get).toHaveBeenCalledWith('/reservations/ABCDEFG');
  });

  it('modifyReservation_shouldPutNewData', async () => {
    const mockModifyData: any = { newStartTime: '2025-01-01T12:00:00' };
    vi.mocked(api.put).mockResolvedValueOnce({ data: {} });

    await reservationService.modify('ABCDEFG', mockModifyData);

    expect(api.put).toHaveBeenCalledWith('/reservations/ABCDEFG', mockModifyData);
  });

  it('cancelReservation_shouldDeleteByConfirmationCode', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await reservationService.cancel('ABCDEFG');

    expect(api.delete).toHaveBeenCalledWith('/reservations/ABCDEFG');
  });

  it('createHold_shouldPostHoldData', async () => {
    const mockHoldData: any = { fieldId: 1, startTime: '2025-01-01T10:00:00', duration: 60, sessionId: 's1' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

    await reservationService.createHold(mockHoldData);

    expect(api.post).toHaveBeenCalledWith('/reservations/hold', mockHoldData);
  });

  it('releaseHold_shouldDeleteBySessionId', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await reservationService.releaseHold('session-123');

    expect(api.delete).toHaveBeenCalledWith('/reservations/hold/session-123');
  });

  it('getRentableEquipment_shouldRetrieveEquipment', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await reservationService.getRentableEquipment();

    expect(api.get).toHaveBeenCalledWith('/equipment/rentable');
  });
});
