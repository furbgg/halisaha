import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

const ThrowErrorComponent = () => {
  throw new Error('Test error');
};

describe('ErrorBoundary', () => {
  it('shouldRenderChildren_whenNoError', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Child Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shouldRenderFallback_whenChildThrows', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Hoppla! Ein unerwarteter/i)).toBeInTheDocument();
    
    spy.mockRestore();
  });

  it('shouldShowRetryButton_inFallback', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/Seite neu laden/i);
    expect(retryButton).toBeInTheDocument();

    spy.mockRestore();
  });
});
