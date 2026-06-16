import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import { AdminDashboard } from '../../../pages/admin/AdminDashboard';
import { dashboardService } from '../../../services/dashboardService';

vi.mock('../../../services/dashboardService', () => ({
  dashboardService: {
    getDashboard: vi.fn(),
  }
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(dashboardService.getDashboard).mockReturnValue(new Promise(() => {}));
    
    render(
      <HelmetProvider>
        <AdminDashboard />
      </HelmetProvider>
    );

    expect(screen.queryByText('Heute')).not.toBeInTheDocument();
  });

  it('renders an error message on failure', async () => {
    vi.mocked(dashboardService.getDashboard).mockRejectedValueOnce(new Error('Network error'));

    render(
      <HelmetProvider>
        <AdminDashboard />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Fehler beim Laden/i)).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('renders dashboard data correctly', async () => {
    const mockData = {
      data: {
        data: {
          todayReservations: 15,
          yesterdayReservations: 10,
          todayRevenue: 450,
          weekRevenue: 2500,
          monthRevenue: 8500,
          monthReservations: 120,
          utilizationPercent: 65,
          refundedAmount: 50,
          failedPaymentCount: 2,
          lastBookingAgo: '5 min',
          fieldStats: [
            { fieldId: 1, fieldName: 'Main Field', reservationCount: 10 }
          ],
          hourlyHeatmap: [],
          monthlyTrend: [],
          paymentMethodStats: [
            { method: 'CARD', count: 10, percentage: 80, revenue: 400 },
            { method: 'CASH', count: 5, percentage: 20, revenue: 50 }
          ],
          todayTimeline: [
            { id: 1, customerName: 'John Doe', startTime: '10:00', endTime: '11:00', fieldName: 'Main Field', status: 'CONFIRMED' }
          ],
          topMaterials: [],
          upcomingReservations: [],
          weeklyRevenue: []
        }
      }
    };
    
    vi.mocked(dashboardService.getDashboard).mockResolvedValueOnce(mockData as any);

    render(
      <HelmetProvider>
        <AdminDashboard />
      </HelmetProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Heute')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText(/450/i)).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('8') && content.includes('500'))).toBeInTheDocument();
      expect(screen.getByText(/65%/)).toBeInTheDocument();
      
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Main Field').length).toBeGreaterThan(0);
    });
  });
});
