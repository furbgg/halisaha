import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HappyHourBadge } from '../../components/common/HappyHourBadge';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('HappyHourBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shouldRenderBadge_whenHappyHourActive', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: {
          enabled: true,
          startTime: '10:00',
          endTime: '12:00',
          discountPercent: 20
        }
      }
    });

    render(<HappyHourBadge />);

    await waitFor(() => {
      expect(screen.getByText(/Happy Hour Aktiv!/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/10:00 - 12:00/i)).toBeInTheDocument();
    expect(screen.getByText(/-20% Rabatt/i)).toBeInTheDocument();
  });

  it('shouldNotRender_whenHappyHourInactive', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        data: {
          enabled: false,
        }
      }
    });

    const { container } = render(<HappyHourBadge />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(screen.queryByText(/Happy Hour Aktiv!/i)).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
