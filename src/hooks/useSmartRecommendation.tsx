import { useState, useEffect, useCallback } from "react";
import { Source } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { normalizeTopic } from "@/utils/normalizeTopic";
import { getRelatedTopics } from "@/utils/topicRelations";

interface RecommendationConfig {
  timeSelected: number;
  topicSelected: string;
  language: 'en' | 'he';
}

interface UserLearningHistory {
  completedSources: string[];
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  topicPreferences: Record<string, number>;
  timePatterns: Record<number, number>;
}

export const useSmartRecommendation = (
  sources: Source[], 
  config: RecommendationConfig
) => {
  const { user } = useAuth();
  const [sourceHistory, setSourceHistory] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<UserLearningHistory>({
    completedSources: [],
    preferredDifficulty: 'beginner',
    topicPreferences: {},
    timePatterns: {}
  });
  const [qualityValidated, setQualityValidated] = useState<Record<string, boolean>>({});


  // Time-based source optimization mapping
  const getTimeBasedFilter = useCallback((timeMinutes: number) => {
    if (timeMinutes <= 10) {
      return {
        types: ['practical_halacha', 'text_study'],
        maxComplexity: 'beginner',
        focus: 'quick_insights'
      };
    } else if (timeMinutes <= 20) {
      return {
        types: ['text_study', 'philosophical'],
        maxComplexity: 'intermediate',
        focus: 'standard_study'
      };
    } else if (timeMinutes <= 30) {
      return {
        types: ['text_study', 'philosophical', 'historical'],
        maxComplexity: 'intermediate',
        focus: 'complex_topics'
      };
    } else if (timeMinutes <= 45) {
      return {
        types: ['philosophical', 'mystical', 'historical'],
        maxComplexity: 'advanced',
        focus: 'comprehensive_study'
      };
    } else {
      return {
        types: ['mystical', 'philosophical', 'historical'],
        maxComplexity: 'advanced',
        focus: 'deep_analysis'
      };
    }
  }, [normalizeTopic]);

  // Enhanced filtering logic with multi-tier approach and quality assurance
  const getFilteredSources = useCallback(() => {
    const timeFilter = getTimeBasedFilter(config.timeSelected);
    const normalizedTopic = normalizeTopic(config.topicSelected);
    
    // Primary filter: exact topic match + optimal time + type compatibility + quality validation
    const primaryFilter = sources.filter(source => {
      const categorySlug = normalizeTopic(source.category);
      const subSlug = normalizeTopic(source.subcategory || '');
      const matchesTopic = [categorySlug, subSlug].some(slug =>
        slug === normalizedTopic ||
        slug.includes(normalizedTopic) ||
        normalizedTopic.includes(slug)
      );
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 5) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 5);
      const typeMatch = !timeFilter.types.length || timeFilter.types.includes(source.source_type || 'text_study');
      const difficultyMatch = getDifficultyWeight(source.difficulty_level || 'beginner') <= 
                             getDifficultyWeight(timeFilter.maxComplexity);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      
      // Quality validation - ensure source has required Torah references and valid Sefaria link
      const hasValidPrompts = !!(source.reflection_prompt && source.reflection_prompt_he);
      const hasSefariaLink = !!(source.sefaria_link && source.sefaria_link.includes('sefaria.org'));
      const qualityCheck = hasValidPrompts && hasSefariaLink;
      
      return matchesTopic && timeMatch && typeMatch && difficultyMatch && notInHistory && 
             source.published && languageMatch && qualityCheck;
    });

    console.debug('Primary filter results', primaryFilter.length);
=======
    if (process.env.NODE_ENV === 'development') {
      console.debug('primaryFilter', primaryFilter.length);
    }

    // Return primary if we have good matches
    if (primaryFilter.length > 0) {
      return primaryFilter;
    }

    // Secondary filter: expand time range but keep topic match
    const secondaryFilter = sources.filter(source => {
      const categorySlug = normalizeTopic(source.category);
      const subSlug = normalizeTopic(source.subcategory || '');
      const matchesTopic = [categorySlug, subSlug].some(slug =>
        slug === normalizedTopic ||
        slug.includes(normalizedTopic) ||
        normalizedTopic.includes(slug)
      );
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 10) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 15);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      
      return matchesTopic && timeMatch && notInHistory && source.published && languageMatch;
    });

    console.debug('Secondary filter results', secondaryFilter.length);
=======
    if (process.env.NODE_ENV === 'development') {
      console.debug('secondaryFilter', secondaryFilter.length);
    }

    if (secondaryFilter.length > 0) {
      return secondaryFilter;
    }

    // Tertiary filter: related topics with time compatibility
    const relatedTopics = getRelatedTopics(normalizedTopic);
    const tertiaryFilter = sources.filter(source => {
      const matchesRelated = relatedTopics.includes(source.category.toLowerCase()) ||
                            relatedTopics.includes(source.subcategory?.toLowerCase() || '');
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 10) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 15);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      
      return matchesRelated && timeMatch && notInHistory && source.published && languageMatch;
    });

    console.debug('Tertiary filter results', tertiaryFilter.length);
=======
    if (process.env.NODE_ENV === 'development') {
      console.debug('tertiaryFilter', tertiaryFilter.length);
    }

    if (tertiaryFilter.length > 0) {
      return tertiaryFilter;
    }

    // Quaternary filter: closest time match with preference for related topics
    const allSources = sources.filter(source =>
      !sourceHistory.includes(source.id) && source.published
    );

    const relatedSet = new Set(
      getRelatedTopics(normalizedTopic)
    );

    const prioritized = allSources
      .filter(s =>
        relatedSet.has(normalizeTopic(s.category)) ||
        relatedSet.has(normalizeTopic(s.subcategory || ''))
      );

    if (process.env.NODE_ENV === 'development') {
      console.debug('quaternary candidates', prioritized.length);
    }

    if (prioritized.length === 0) {
      return [];
    }

    console.debug('Quaternary pool size', pool.length);

    return pool.sort((a, b) => {
=======
    return prioritized.sort((a, b) => {
      const aTimeDiff = Math.abs(a.estimated_time - config.timeSelected);
      const bTimeDiff = Math.abs(b.estimated_time - config.timeSelected);
      return aTimeDiff - bTimeDiff;
    }).slice(0, 5);
  }, [sources, config, sourceHistory, getTimeBasedFilter, normalizeTopic]);


  // Difficulty weighting for intelligent selection
  const getDifficultyWeight = useCallback((difficulty: string): number => {
    const weights = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return weights[difficulty as keyof typeof weights] || 1;
  }, []);

  // Smart source selection with user history weighting
  const getRecommendedSource = useCallback(() => {
    const filteredSources = getFilteredSources();
    
    if (filteredSources.length === 0) {
      return null;
    }

    // For surprise category, implement true variety
    if (normalizeTopic(config.topicSelected) === 'surprise') {
      const categoryCounts: Record<string, number> = {};
      filteredSources.forEach(source => {
        categoryCounts[source.category] = (categoryCounts[source.category] || 0) + 1;
      });
      
      // Prefer categories with fewer recent selections
      const weightedSources = filteredSources.map(source => ({
        source,
        weight: 1 / (categoryCounts[source.category] || 1)
      }));
      
      const totalWeight = weightedSources.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const item of weightedSources) {
        random -= item.weight;
        if (random <= 0) {
          return item.source;
        }
      }
    }

    // Weighted selection based on user preferences and difficulty
    const userPreferredDifficulty = userHistory.preferredDifficulty;
    const difficultyWeights = {
      'beginner': userPreferredDifficulty === 'beginner' ? 3 : 1,
      'intermediate': userPreferredDifficulty === 'intermediate' ? 3 : 2,
      'advanced': userPreferredDifficulty === 'advanced' ? 3 : 1
    };

    const weightedSources = filteredSources.map(source => {
      const difficultyWeight = difficultyWeights[source.difficulty_level || 'beginner'];
      const topicPreference = userHistory.topicPreferences[source.category] || 1;
      const freshnessBonus = sourceHistory.includes(source.id) ? 0.1 : 1;
      
      return {
        source,
        weight: difficultyWeight * topicPreference * freshnessBonus
      };
    });

    // Select based on weighted random
    const totalWeight = weightedSources.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of weightedSources) {
      random -= item.weight;
      if (random <= 0) {
        return item.source;
      }
    }

    // Fallback to first source
    return filteredSources[0];
  }, [getFilteredSources, config, userHistory, sourceHistory]);

  // Add source to history
  const addToHistory = useCallback((sourceId: string) => {
    setSourceHistory(prev => {
      const newHistory = [sourceId, ...prev];
      // Keep only last 20 sources to prevent excessive memory usage
      return newHistory.slice(0, 20);
    });
  }, []);

  // Update user learning patterns
  const updateUserHistory = useCallback((source: Source, action: 'completed' | 'skipped' | 'saved') => {
    if (action === 'completed') {
      setUserHistory(prev => ({
        ...prev,
        completedSources: [...prev.completedSources, source.id],
        topicPreferences: {
          ...prev.topicPreferences,
          [source.category]: (prev.topicPreferences[source.category] || 1) + 0.2
        },
        timePatterns: {
          ...prev.timePatterns,
          [config.timeSelected]: (prev.timePatterns[config.timeSelected] || 1) + 0.1
        }
      }));
    }
  }, [config.timeSelected]);

  // Get source statistics for UI display
  const getSourceStats = useCallback(() => {
    const stats = sources.reduce((acc, source) => {
      if (!source.published) return acc;
      
      const category = source.category;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          timeRanges: {} as Record<string, number>,
          difficulties: {} as Record<string, number>
        };
      }
      
      acc[category].total++;
      
      // Time range categorization
      const timeRange = source.estimated_time <= 15 ? '5-15min' :
                       source.estimated_time <= 30 ? '15-30min' : '30-60min';
      acc[category].timeRanges[timeRange] = (acc[category].timeRanges[timeRange] || 0) + 1;
      
      // Difficulty distribution
      const difficulty = source.difficulty_level || 'beginner';
      acc[category].difficulties[difficulty] = (acc[category].difficulties[difficulty] || 0) + 1;
      
      return acc;
    }, {} as Record<string, any>);
    
    return stats;
  }, [sources]);

  return {
    getRecommendedSource,
    addToHistory,
    updateUserHistory,
    getSourceStats,
    sourceHistory,
    userHistory,
    getFilteredSources
  };
};
