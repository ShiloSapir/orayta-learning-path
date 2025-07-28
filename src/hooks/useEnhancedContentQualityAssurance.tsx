import { useState, useCallback, useEffect } from "react";
import { Source } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";

interface QualityMetrics {
  hasValidSefariaLink: boolean;
  hasTranslations: boolean;
  hasReflectionPrompts: boolean;
  timeRangeValid: boolean;
  difficultyAssigned: boolean;
  hasTextExcerpt: boolean;
  contentDepth: number;
  languageQuality: number;
  engagementLevel: number;
  culturalSensitivity: number;
  score: number;
}

interface ContentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  qualityScore: number;
}

interface QualityReport {
  totalSources: number;
  averageScore: number;
  distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  topIssues: string[];
  recommendations: string[];
  categoryBreakdown: Record<string, number>;
}

export const useEnhancedContentQualityAssurance = () => {
  const [validationCache, setValidationCache] = useState<Record<string, QualityMetrics>>({});
  const [qualityTrends, setQualityTrends] = useState<any[]>([]);

  // Real-time Sefaria API validation
  const validateSefariaLink = useCallback(async (url: string): Promise<boolean> => {
    try {
      const urlPattern = /^https:\/\/(www\.)?sefaria\.org\/.+/;
      if (!urlPattern.test(url)) return false;

      // Extract text reference from URL for API validation
      const match = url.match(/sefaria\.org\/([^?]+)/);
      if (!match) return false;

      const textRef = match[1];
      const apiUrl = `https://www.sefaria.org/api/texts/${textRef}`;
      
      const response = await fetch(apiUrl);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Enhanced translation validation with NLP analysis
  const validateTranslations = useCallback((source: Source): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let qualityScore = 100;

    // Check presence of both languages
    const hasEnglish = !!(source.title && source.reflection_prompt && source.text_excerpt);
    const hasHebrew = !!(source.title_he && source.reflection_prompt_he && source.text_excerpt_he);
    
    if (!hasEnglish) {
      errors.push("Missing English content (title, reflection prompt, or text excerpt)");
      qualityScore -= 30;
    }
    
    if (!hasHebrew) {
      errors.push("Missing Hebrew content (title, reflection prompt, or text excerpt)");
      qualityScore -= 30;
    }

    // Validate Hebrew character usage
    const hebrewPattern = /[\u0590-\u05FF]/;
    if (hasHebrew) {
      if (!hebrewPattern.test(source.title_he)) {
        warnings.push("Hebrew title doesn't contain Hebrew characters");
        qualityScore -= 10;
      }
      
      if (!hebrewPattern.test(source.reflection_prompt_he)) {
        warnings.push("Hebrew reflection prompt doesn't contain Hebrew characters");
        qualityScore -= 10;
      }
    }

    // Check for Google Translate artifacts
    const translateArtifacts = ['translated by Google', 'תורגם על ידי גוגל'];
    const englishContent = `${source.title} ${source.reflection_prompt} ${source.text_excerpt}`.toLowerCase();
    const hebrewContent = `${source.title_he} ${source.reflection_prompt_he} ${source.text_excerpt_he}`;
    
    if (translateArtifacts.some(artifact => englishContent.includes(artifact.toLowerCase()) || hebrewContent.includes(artifact))) {
      warnings.push("Content may contain machine translation artifacts");
      qualityScore -= 15;
    }

    // Validate content length balance
    if (hasEnglish && hasHebrew) {
      const englishLength = source.title.length + source.reflection_prompt.length;
      const hebrewLength = source.title_he.length + source.reflection_prompt_he.length;
      const ratio = Math.min(englishLength, hebrewLength) / Math.max(englishLength, hebrewLength);
      
      if (ratio < 0.5) {
        suggestions.push("Content length imbalance between languages - consider reviewing translations");
        qualityScore -= 5;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      qualityScore: Math.max(0, qualityScore)
    };
  }, []);

  // Advanced reflection prompt analysis
  const validateReflectionPrompts = useCallback((source: Source): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let qualityScore = 100;

    if (!source.reflection_prompt || !source.reflection_prompt_he) {
      errors.push("Missing reflection prompts in one or both languages");
      return { isValid: false, errors, warnings, suggestions, qualityScore: 0 };
    }

    // Analyze engagement elements
    const engagementWords = [
      'reflect', 'consider', 'think', 'explore', 'examine', 'contemplate',
      'ponder', 'meditate', 'connect', 'relate', 'apply', 'integrate'
    ];
    
    const hebrewEngagementWords = [
      'הרהר', 'חשב', 'בחן', 'התבונן', 'התעמק', 'חקור', 'קשר', 'יישם'
    ];

    const englishPrompt = source.reflection_prompt.toLowerCase();
    const hebrewPrompt = source.reflection_prompt_he;

    const englishEngagement = engagementWords.filter(word => englishPrompt.includes(word)).length;
    const hebrewEngagement = hebrewEngagementWords.filter(word => hebrewPrompt.includes(word)).length;

    if (englishEngagement === 0) {
      warnings.push("English reflection prompt lacks engaging language");
      qualityScore -= 15;
    }
    
    if (hebrewEngagement === 0) {
      warnings.push("Hebrew reflection prompt lacks engaging language");
      qualityScore -= 15;
    }

    // Check for questions
    const englishQuestions = (source.reflection_prompt.match(/\?/g) || []).length;
    const hebrewQuestions = (source.reflection_prompt_he.match(/\?/g) || []).length;

    if (englishQuestions === 0) {
      suggestions.push("Consider adding questions to English reflection prompt");
      qualityScore -= 10;
    }
    
    if (hebrewQuestions === 0) {
      suggestions.push("Consider adding questions to Hebrew reflection prompt");
      qualityScore -= 10;
    }

    // Check prompt depth and specificity
    const depthKeywords = ['why', 'how', 'what if', 'imagine', 'compare', 'contrast'];
    const hebrewDepthKeywords = ['מדוע', 'כיצד', 'מה אם', 'תאר', 'השווה'];

    const englishDepth = depthKeywords.filter(word => englishPrompt.includes(word)).length;
    const hebrewDepth = hebrewDepthKeywords.filter(word => hebrewPrompt.includes(word)).length;

    if (englishDepth < 2) {
      suggestions.push("English prompt could be more thought-provoking");
      qualityScore -= 5;
    }
    
    if (hebrewDepth < 2) {
      suggestions.push("Hebrew prompt could be more thought-provoking");
      qualityScore -= 5;
    }

    // Check length appropriateness
    const englishLength = source.reflection_prompt.length;
    const hebrewLength = source.reflection_prompt_he.length;

    if (englishLength < 50) {
      warnings.push("English reflection prompt might be too short");
      qualityScore -= 10;
    } else if (englishLength > 500) {
      warnings.push("English reflection prompt might be too long");
      qualityScore -= 10;
    }

    if (hebrewLength < 30) {
      warnings.push("Hebrew reflection prompt might be too short");
      qualityScore -= 10;
    } else if (hebrewLength > 400) {
      warnings.push("Hebrew reflection prompt might be too long");
      qualityScore -= 10;
    }

    return {
      isValid: errors.length === 0 && warnings.length < 3,
      errors,
      warnings,
      suggestions,
      qualityScore: Math.max(0, qualityScore)
    };
  }, []);

  // Cultural sensitivity and religious appropriateness validation
  const validateCulturalSensitivity = useCallback((source: Source): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let qualityScore = 100;

    // Check for inappropriate content
    const problematicTerms = ['convert', 'missionary', 'supersession'];
    const content = `${source.title} ${source.reflection_prompt} ${source.text_excerpt}`.toLowerCase();

    problematicTerms.forEach(term => {
      if (content.includes(term)) {
        warnings.push(`Content contains potentially sensitive term: "${term}"`);
        qualityScore -= 20;
      }
    });

    // Validate Hebrew religious terminology
    const hebrewContent = `${source.title_he} ${source.reflection_prompt_he} ${source.text_excerpt_he}`;
    
    // Check for proper use of sacred names
    if (hebrewContent.includes('יהוה') && !source.category.toLowerCase().includes('tanakh')) {
      suggestions.push("Consider using appropriate substitutions for sacred names");
      qualityScore -= 5;
    }

    // Validate respectful language
    const respectfulTerms = ['sacred', 'holy', 'blessed', 'wisdom'];
    const respectfulCount = respectfulTerms.filter(term => content.includes(term)).length;
    
    if (respectfulCount === 0 && source.category.toLowerCase() !== 'halacha') {
      suggestions.push("Consider incorporating more respectful/spiritual language");
      qualityScore -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      qualityScore: Math.max(0, qualityScore)
    };
  }, []);

  // Enhanced difficulty balance validation
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
      return { isValid: false, errors, warnings, suggestions, qualityScore: 0 };
    }

    // Advanced difficulty distribution analysis
    const difficultyCount = timeCompatibleSources.reduce((acc, source) => {
      const level = source.difficulty_level || 'beginner';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = timeCompatibleSources.length;
    const beginnerPercent = (difficultyCount.beginner || 0) / total;
    const intermediatePercent = (difficultyCount.intermediate || 0) / total;
    const advancedPercent = (difficultyCount.advanced || 0) / total;

    // Optimal distribution varies by time slot
    let optimalBeginner = 0.5;
    let optimalIntermediate = 0.3;
    let optimalAdvanced = 0.2;

    if (timeSlot <= 15) {
      optimalBeginner = 0.6;
      optimalIntermediate = 0.3;
      optimalAdvanced = 0.1;
    } else if (timeSlot >= 45) {
      optimalBeginner = 0.3;
      optimalIntermediate = 0.4;
      optimalAdvanced = 0.3;
    }

    const beginnerDeviation = Math.abs(beginnerPercent - optimalBeginner);
    const intermediateDeviation = Math.abs(intermediatePercent - optimalIntermediate);
    const advancedDeviation = Math.abs(advancedPercent - optimalAdvanced);

    if (beginnerDeviation > 0.2) {
      warnings.push(`Beginner distribution (${Math.round(beginnerPercent * 100)}%) deviates from optimal (${Math.round(optimalBeginner * 100)}%)`);
    }
    
    if (intermediateDeviation > 0.2) {
      warnings.push(`Intermediate distribution (${Math.round(intermediatePercent * 100)}%) deviates from optimal (${Math.round(optimalIntermediate * 100)}%)`);
    }
    
    if (advancedDeviation > 0.2) {
      warnings.push(`Advanced distribution (${Math.round(advancedPercent * 100)}%) deviates from optimal (${Math.round(optimalAdvanced * 100)}%)`);
    }

    // Category diversity check
    const categories = new Set(timeCompatibleSources.map(s => s.category));
    if (categories.size < 3 && total > 10) {
      suggestions.push(`Consider adding more category diversity for ${timeSlot}min slot`);
    }

    const qualityScore = Math.max(0, 100 - (beginnerDeviation + intermediateDeviation + advancedDeviation) * 100);

    return {
      isValid: warnings.length < 2,
      errors,
      warnings,
      suggestions,
      qualityScore
    };
  }, []);

  // Comprehensive source quality assessment
  const assessSourceQuality = useCallback(async (source: Source): Promise<QualityMetrics> => {
    if (validationCache[source.id]) {
      return validationCache[source.id];
    }

    const [
      sefariaValid,
      translationValidation,
      promptValidation,
      culturalValidation
    ] = await Promise.all([
      validateSefariaLink(source.sefaria_link),
      Promise.resolve(validateTranslations(source)),
      Promise.resolve(validateReflectionPrompts(source)),
      Promise.resolve(validateCulturalSensitivity(source))
    ]);

    const metrics: QualityMetrics = {
      hasValidSefariaLink: sefariaValid,
      hasTranslations: translationValidation.isValid,
      hasReflectionPrompts: promptValidation.isValid,
      timeRangeValid: !!(source.min_time && source.max_time && source.min_time <= source.max_time),
      difficultyAssigned: !!source.difficulty_level,
      hasTextExcerpt: !!(source.text_excerpt || source.text_excerpt_he),
      contentDepth: promptValidation.qualityScore,
      languageQuality: translationValidation.qualityScore,
      engagementLevel: promptValidation.qualityScore,
      culturalSensitivity: culturalValidation.qualityScore,
      score: 0
    };

    // Calculate weighted quality score
    const weights = {
      sefariaLink: 15,
      translations: 20,
      reflectionPrompts: 20,
      timeRange: 10,
      difficulty: 10,
      textExcerpt: 10,
      contentDepth: 15
    };

    let totalScore = 0;
    totalScore += sefariaValid ? weights.sefariaLink : 0;
    totalScore += translationValidation.isValid ? weights.translations : translationValidation.qualityScore * weights.translations / 100;
    totalScore += promptValidation.isValid ? weights.reflectionPrompts : promptValidation.qualityScore * weights.reflectionPrompts / 100;
    totalScore += metrics.timeRangeValid ? weights.timeRange : 0;
    totalScore += metrics.difficultyAssigned ? weights.difficulty : 0;
    totalScore += metrics.hasTextExcerpt ? weights.textExcerpt : 0;
    totalScore += culturalValidation.qualityScore * weights.contentDepth / 100;

    metrics.score = totalScore;

    // Cache the result
    setValidationCache(prev => ({ ...prev, [source.id]: metrics }));

    return metrics;
  }, [validationCache, validateSefariaLink, validateTranslations, validateReflectionPrompts, validateCulturalSensitivity]);

  // Generate comprehensive quality report
  const getQualityReport = useCallback(async (sources: Source[]): Promise<QualityReport> => {
    const assessments = await Promise.all(
      sources.map(source => assessSourceQuality(source))
    );

    const totalSources = sources.length;
    const averageScore = assessments.reduce((sum, a) => sum + a.score, 0) / totalSources;

    const excellent = assessments.filter(a => a.score >= 85).length;
    const good = assessments.filter(a => a.score >= 70 && a.score < 85).length;
    const fair = assessments.filter(a => a.score >= 55 && a.score < 70).length;
    const poor = assessments.filter(a => a.score < 55).length;

    // Identify top issues
    const issues: Record<string, number> = {};
    assessments.forEach(assessment => {
      if (!assessment.hasValidSefariaLink) issues['Invalid Sefaria links'] = (issues['Invalid Sefaria links'] || 0) + 1;
      if (!assessment.hasTranslations) issues['Missing translations'] = (issues['Missing translations'] || 0) + 1;
      if (!assessment.hasReflectionPrompts) issues['Poor reflection prompts'] = (issues['Poor reflection prompts'] || 0) + 1;
      if (!assessment.timeRangeValid) issues['Invalid time ranges'] = (issues['Invalid time ranges'] || 0) + 1;
      if (assessment.culturalSensitivity < 80) issues['Cultural sensitivity concerns'] = (issues['Cultural sensitivity concerns'] || 0) + 1;
    });

    const topIssues = Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue, count]) => `${issue}: ${count} sources`);

    // Category breakdown
    const categoryBreakdown = sources.reduce((acc, source, index) => {
      const score = assessments[index].score;
      acc[source.category] = (acc[source.category] || 0) + score;
      return acc;
    }, {} as Record<string, number>);

    // Normalize by category count
    Object.keys(categoryBreakdown).forEach(category => {
      const count = sources.filter(s => s.category === category).length;
      categoryBreakdown[category] = categoryBreakdown[category] / count;
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (poor > totalSources * 0.15) recommendations.push("Prioritize improving low-quality sources");
    if (averageScore < 75) recommendations.push("Overall content quality needs attention");
    if (issues['Invalid Sefaria links']) recommendations.push("Validate and fix Sefaria links");
    if (issues['Missing translations']) recommendations.push("Complete missing translations");
    if (issues['Cultural sensitivity concerns']) recommendations.push("Review content for cultural sensitivity");

    return {
      totalSources,
      averageScore,
      distribution: { excellent, good, fair, poor },
      topIssues,
      recommendations,
      categoryBreakdown
    };
  }, [assessSourceQuality]);

  // Track quality trends over time
  const trackQualityTrends = useCallback(async () => {
    const { data: sourcesData } = await supabase
      .from('sources')
      .select('*')
      .eq('published', true);

    if (sourcesData) {
      // Type cast the sources to match the Source interface
      const sources = sourcesData as Source[];
      const report = await getQualityReport(sources);
      const trend = {
        timestamp: new Date().toISOString(),
        averageScore: report.averageScore,
        distribution: report.distribution,
        totalSources: report.totalSources
      };
      
      setQualityTrends(prev => [...prev.slice(-29), trend]); // Keep last 30 data points
    }
  }, [getQualityReport]);

  useEffect(() => {
    // Track quality trends weekly
    const interval = setInterval(trackQualityTrends, 7 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [trackQualityTrends]);

  return {
    assessSourceQuality,
    validateTranslations,
    validateReflectionPrompts,
    validateDifficultyBalance,
    validateCulturalSensitivity,
    getQualityReport,
    qualityTrends,
    clearCache: () => setValidationCache({})
  };
};