import { useEffect } from "react";

interface AccessibilityImprovementProps {
  language: 'en' | 'he';
}

export function AccessibilityImprovement({ language }: AccessibilityImprovementProps) {

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;

    // Update document title for screen readers
    document.title = language === 'he' 
      ? 'אוריאתא - פלטפורמת לימוד תורה'
      : 'Orayata - Torah Learning Platform';

    // Add meta tags for better accessibility
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }

    // Ensure proper focus management
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const firstFocusableElement = document.querySelector(focusableElements) as HTMLElement;
    
    // Add skip to main content link
    let skipLink = document.getElementById('skip-to-main') as HTMLAnchorElement | null;
    if (!skipLink && firstFocusableElement) {
      skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = language === 'he' ? 'דלג לתוכן הראשי' : 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

  }, [language]);

  useEffect(() => {
    // Add high contrast mode support
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('high-contrast', e.matches);
    };

    mediaQuery.addEventListener('change', handleContrastChange);
    handleContrastChange({ matches: mediaQuery.matches } as MediaQueryListEvent);

    return () => {
      mediaQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return null;
}