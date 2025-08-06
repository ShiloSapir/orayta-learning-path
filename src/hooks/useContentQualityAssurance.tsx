import { useState, useCallback } from "react";
import { Source } from "@/hooks/useSupabaseData";

interface QualityMetrics {
  hasValidSefariaLink: boolean;
  hasTranslations: boolean;
  hasReflectionPrompts: boolean;
  timeRangeValid: boolean;
  difficultyAssigned: boolean;
  hasTextExcerpt: boolean;
  score: number;
}

interface ContentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export const useContentQualityAssurance = () => {
  const [validationCache, setValidationCache] = useState<Record<string, QualityMetrics>>({});

  // Validate Sefaria link functionality
  const validateSefariaLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Basic URL validation
      const urlPattern = /^https:\/\/(www\.)?sefaria\.org\/.+/;
      if (!urlPattern.test(url)) return false;

      // Check if link is accessible (simplified check)
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      return true; // If no error thrown, assume accessible
    } catch {
      return false;
    }
  }, []);

  // Validate Hebrew and English translations
  const validateTranslations = useCallback((source: Source): boolean => {
    const hasEnglish = !!(source.title && source.reflection_prompt);
    const hasHebrew = !!(source.title_he && source.reflection_prompt_he);
    
    // Check for proper Hebrew characters
    const hebrewPattern = /[\u0590-\u05FF]/;
    const hasValidHebrew = hebrewPattern.test(source.title_he) && 
                          hebrewPattern.test(source.reflection_prompt_he);
    
    return hasEnglish && hasHebrew && hasValidHebrew;
  }, []);

  // Validate reflection prompt engagement quality
  const validateReflectionPrompts = useCallback((source: Source): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if prompts exist
    if (!source.reflection_prompt || !source.reflection_prompt_he) {
      errors.push("Missing reflection prompts in one or both languages");
    }

    // Check prompt length (should be substantial but not too long)
    if (source.reflection_prompt && source.reflection_prompt.length < 20) {
      warnings.push("English reflection prompt seems too short");
    }
    if (source.reflection_prompt && source.reflection_prompt.length > 500) {
      warnings.push("English reflection prompt might be too long");
    }

    // Check for engagement elements
    const engagementWords = ['reflect', 'consider', 'think', 'explore', 'examine', 'contemplate'];
    const hasEngagement = engagementWords.some(word => 
      source.reflection_prompt?.toLowerCase().includes(word)
    );
    
    if (!hasEngagement) {
      suggestions.push("Consider adding more engaging language to prompt reflection");
    }

    // Check for question marks (indicates interactive prompts)
    const hasQuestions = source.reflection_prompt?.includes('?') || false;
    if (!hasQuestions) {
      suggestions.push("Consider adding questions to make prompts more interactive");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, []);

  // Balance difficulty levels within time slots
  const validateDifficultyBalance = useCallback((sources: Source[], timeSlot: number): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const timeCompatibleSources = sources.filter(source => 
      timeSlot >= (source.min_time || source.estimated_time - 5) &&
      timeSlot <= (source.max_time || source.estimated_time + 5)
    );

    if (timeCompatibleSources.length === 0) {
      errors.push(`No sources available for ${timeSlot} minute time slot`);
      return { isValid: false, errors, warnings, suggestions };
    }

    // Check difficulty distribution
    const difficultyCount = timeCompatibleSources.reduce((acc, source) => {
      const level = source.difficulty_level || 'beginner';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = timeCompatibleSources.length;
    const beginnerPercent = (difficultyCount.beginner || 0) / total;
    const advancedPercent = (difficultyCount.advanced || 0) / total;

    // Ideal distribution: 50% beginner, 30% intermediate, 20% advanced
    if (beginnerPercent < 0.3) {
      warnings.push(`Time slot ${timeSlot}min has too few beginner sources (${Math.round(beginnerPercent * 100)}%)`);
    }
    if (beginnerPercent > 0.7) {
      suggestions.push(`Time slot ${timeSlot}min could use more intermediate/advanced sources`);
    }
    if (advancedPercent > 0.4) {
      warnings.push(`Time slot ${timeSlot}min might be too heavy on advanced sources`);
    }

    return {
      isValid: warnings.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, []);

  // Comprehensive source quality assessment
  const assessSourceQuality = useCallback(async (source: Source): Promise<QualityMetrics> => {
    // Check cache first
    if (validationCache[source.id]) {
      return validationCache[source.id];
    }

    const metrics: QualityMetrics = {
      hasValidSefariaLink: await validateSefariaLink(source.sefaria_link),
      hasTranslations: validateTranslations(source),
      hasReflectionPrompts: !!(source.reflection_prompt && source.reflection_prompt_he),
      timeRangeValid: !!(source.min_time && source.max_time && source.min_time <= source.max_time),
      difficultyAssigned: !!source.difficulty_level,
      hasTextExcerpt: !!(source.text_excerpt || source.text_excerpt_he),
      score: 0
    };

    // Calculate quality score (0-100)
    const checks = [
      metrics.hasValidSefariaLink,
      metrics.hasTranslations,
      metrics.hasReflectionPrompts,
      metrics.timeRangeValid,
      metrics.difficultyAssigned,
      metrics.hasTextExcerpt
    ];

    metrics.score = (checks.filter(Boolean).length / checks.length) * 100;

    // Cache the result
    setValidationCache(prev => ({ ...prev, [source.id]: metrics }));

    return metrics;
  }, [validationCache, validateSefariaLink, validateTranslations]);

  // Validate source references for Torah texts
  const validateTorahReferences = useCallback((source: Source): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if source has proper start and end references
    if (!source.start_ref || !source.end_ref) {
      errors.push("Missing Torah reference range (start_ref or end_ref)");
    }

    // Validate reference format for different source types
    if (source.category.toLowerCase() === 'tanakh') {
      // Torah references should follow format like "Genesis 1:1"
      const torahPattern = /^[A-Za-z]+\s+\d+:\d+$/;
      if (source.start_ref && !torahPattern.test(source.start_ref)) {
        warnings.push("Torah start reference format may be incorrect");
      }
      if (source.end_ref && !torahPattern.test(source.end_ref)) {
        warnings.push("Torah end reference format may be incorrect");
      }
    }

    // Check if range makes logical sense
    if (source.start_ref && source.end_ref) {
      // Basic check if they reference the same book
      const startBook = source.start_ref.split(' ')[0];
      const endBook = source.end_ref.split(' ')[0];
      
      if (startBook !== endBook) {
        suggestions.push("Consider if cross-book references are appropriate for the time allocation");
      }
    }

    // Ensure Sefaria link matches the references
    if (source.sefaria_link && source.start_ref) {
      const refInLink = source.sefaria_link.includes(source.start_ref.replace(/\s+/g, '.'));
      if (!refInLink) {
        warnings.push("Sefaria link may not match the specified references");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }, []);

  // Get quality report for a set of sources
  const getQualityReport = useCallback(async (sources: Source[]) => {
    const assessments = await Promise.all(
      sources.map(source => assessSourceQuality(source))
    );

    const totalSources = sources.length;
    const highQuality = assessments.filter(a => a.score >= 80).length;
    const mediumQuality = assessments.filter(a => a.score >= 60 && a.score < 80).length;
    const lowQuality = assessments.filter(a => a.score < 60).length;

    const averageScore = assessments.reduce((sum, a) => sum + a.score, 0) / totalSources;

    return {
      totalSources,
      averageScore,
      distribution: {
        high: highQuality,
        medium: mediumQuality,
        low: lowQuality
      },
      recommendations: [
        ...(lowQuality > totalSources * 0.2 ? ["Consider improving low-quality sources"] : []),
        ...(averageScore < 70 ? ["Overall content quality needs improvement"] : []),
        ...(assessments.some(a => !a.hasValidSefariaLink) ? ["Some Sefaria links need validation"] : [])
      ]
    };
  }, [assessSourceQuality]);

  // Clear validation cache
  const clearCache = useCallback(() => {
    setValidationCache({});
  }, []);

  return {
    assessSourceQuality,
    validateReflectionPrompts,
    validateDifficultyBalance,
    validateTorahReferences,
    getQualityReport,
    clearCache
  };
};