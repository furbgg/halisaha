import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contactService } from '../../services/contactService';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submitContactForm_shouldPostFormData', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ data: {} });
    const formData = { name: 'John', email: 'john@example.com', message: 'Hello' };

    await contactService.submit(formData);

    expect(api.post).toHaveBeenCalledWith('/contact', formData);
  });

  it('getAll_shouldFetchWithStatusParam', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    await contactService.getAll('NEW');

    expect(api.get).toHaveBeenCalledWith('/admin/contact', { params: { status: 'NEW' } });
  });

  it('getById_shouldFetchMessage', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: {} });

    await contactService.getById(5);

    expect(api.get).toHaveBeenCalledWith('/admin/contact/5');
  });

  it('countNew_shouldFetchCount', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: 3 });

    await contactService.countNew();

    expect(api.get).toHaveBeenCalledWith('/admin/contact/count');
  });

  it('markReplied_shouldPatchStatus', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await contactService.markReplied(5);

    expect(api.patch).toHaveBeenCalledWith('/admin/contact/5/replied');
  });

  it('archive_shouldPatchStatus', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await contactService.archive(5);

    expect(api.patch).toHaveBeenCalledWith('/admin/contact/5/archive');
  });

  it('updateNotes_shouldPatchNotes', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

    await contactService.updateNotes(5, 'User contacted us via phone');

    expect(api.patch).toHaveBeenCalledWith('/admin/contact/5/notes', { notes: 'User contacted us via phone' });
  });
});
