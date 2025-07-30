import { useEffect, useState } from 'react';

/**
 * Ensures a loading state is displayed for at least the given duration.
 * Returns true while loading should be shown.
 */
export const useMinimumLoading = (
  isLoading: boolean,
  minDuration = 500
) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isLoading) {
      setShowLoading(true);
    } else if (showLoading) {
      timer = setTimeout(() => setShowLoading(false), minDuration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, minDuration, showLoading]);
  return showLoading;
};
