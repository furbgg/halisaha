import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Ensures that navigating between routes in the SPA automatically scrolls the page
 * back to the top, avoiding the issue where the user stays at the bottom of the new page.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}
