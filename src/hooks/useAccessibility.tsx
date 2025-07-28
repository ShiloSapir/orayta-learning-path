import { useEffect, useState, useCallback } from 'react';

interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
}

export const useAccessibility = () => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    reduceMotion: false,
    highContrast: false,
    screenReaderEnabled: false,
    fontSize: 'medium'
  });

  // Detect system accessibility preferences
  useEffect(() => {
    const detectPreferences = () => {
      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detect high contrast preference
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Detect screen reader (basic detection)
      const screenReaderEnabled = !!(
        navigator.userAgent.match(/NVDA|JAWS|VoiceOver|ORCA|Dragon/i) ||
        window.navigator.userAgent.includes('Talkback')
      );

      setPreferences(prev => ({
        ...prev,
        reduceMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
        screenReaderEnabled
      }));

      // Apply CSS classes based on preferences
      const root = document.documentElement;
      if (prefersReducedMotion) {
        root.classList.add('reduce-motion');
      }
      if (prefersHighContrast) {
        root.classList.add('high-contrast');
      }
    };

    detectPreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)')
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', detectPreferences);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', detectPreferences);
      });
    };
  }, []);

  // Update font size
  const setFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize: size }));
    
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xl');
    root.classList.add(`font-${size}`);
    
    // Store preference
    localStorage.setItem('accessibility-font-size', size);
  }, []);

  // Toggle high contrast
  const toggleHighContrast = useCallback(() => {
    setPreferences(prev => {
      const newHighContrast = !prev.highContrast;
      const root = document.documentElement;
      
      if (newHighContrast) {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
      
      localStorage.setItem('accessibility-high-contrast', String(newHighContrast));
      return { ...prev, highContrast: newHighContrast };
    });
  }, []);

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Skip to main content
  const skipToMain = useCallback(() => {
    focusElement('main, [role="main"], #main-content');
  }, [focusElement]);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.position = 'absolute';
    announcer.style.left = '-10000px';
    announcer.style.width = '1px';
    announcer.style.height = '1px';
    announcer.style.overflow = 'hidden';
    
    document.body.appendChild(announcer);
    announcer.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }, []);

  // Load saved preferences
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility-font-size') as AccessibilityPreferences['fontSize'];
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
    
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
    
    if (savedHighContrast) {
      toggleHighContrast();
    }
  }, []);

  return {
    preferences,
    setFontSize,
    toggleHighContrast,
    focusElement,
    skipToMain,
    announce
  };
};

// Additional hook for accessibility announcements (backward compatibility)
export const useAccessibilityAnnouncements = () => {
  const { announce } = useAccessibility();
  return { announce };
};