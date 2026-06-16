import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from '../../components/common/SEO';

vi.mock('../../utils/structuredData', () => ({
  getSportsLocationJsonLd: vi.fn(() => ({ '@context': 'https://schema.org' })),
}));

describe('SEO', () => {
  const renderSEO = (props = {}) => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <SEO {...props} />
        </MemoryRouter>
      </HelmetProvider>,
    );
  };

  it('shouldSetDocumentTitle', async () => {
    renderSEO({ title: 'Test Page' });

    await waitFor(() => {
      expect(document.title).toBe('Test Page | SALAMANDA SOCCER ARENA');
    });
  });

  it('shouldSetMetaDescription', async () => {
    renderSEO({ description: 'Test Description' });

    await waitFor(() => {
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toHaveAttribute('content', 'Test Description');
    });
  });

  it('shouldSetNoIndexRobots_whenNoindexIsTrue', async () => {
    renderSEO({ noindex: true });

    await waitFor(() => {
      const robots = document.querySelector('meta[name="robots"]');
      expect(robots).toHaveAttribute('content', 'noindex, nofollow, noarchive');
    });
  });
});
