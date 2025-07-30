import { useState, useCallback } from "react";
import { Source } from "@/hooks/useSupabaseData";
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
  const [sourceHistory, setSourceHistory] = useState<string[]>([]);
  const [userHistory, setUserHistory] = useState<UserLearningHistory>({
    completedSources: [],
    preferredDifficulty: 'beginner',
    topicPreferences: {},
    timePatterns: {}
  });



  // Enhanced filtering logic with exact topic matching priority
  const getFilteredSources = useCallback(() => {
    const normalizedTopic = normalizeTopic(config.topicSelected);
    
    console.log('🔍 Filtering for topic:', config.topicSelected, '→', normalizedTopic);
    console.log('📊 Total sources available:', sources.length);
    console.log('⏰ Time selected:', config.timeSelected, 'minutes');
    
    // Primary filter: EXACT topic match with flexible time (±15 minutes)
    const exactMatches = sources.filter(source => {
      const categorySlug = normalizeTopic(source.category);
      const subSlug = normalizeTopic(source.subcategory || '');
      
      // Only exact matches
      const exactTopicMatch = categorySlug === normalizedTopic || subSlug === normalizedTopic;
      
      // Much more flexible time matching
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 15) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 15);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      // Simplified quality check - just needs to be published
      const basicQuality = source.published;
      
      const matches = exactTopicMatch && timeMatch && notInHistory && languageMatch && basicQuality;
      
      if (exactTopicMatch) {
        console.log('📝 Exact match found:', source.title, 'Category:', categorySlug, 'Sub:', subSlug, 'Time:', source.estimated_time, 'Matches all filters:', matches);
      }
      
      return matches;
    });

    console.log('✅ Exact matches found:', exactMatches.length);

    // Return exact matches if we have them
    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Secondary filter: partial topic match with even more flexible time
    const secondaryFilter = sources.filter(source => {
      const categorySlug = normalizeTopic(source.category);
      const subSlug = normalizeTopic(source.subcategory || '');
      const matchesTopic = [categorySlug, subSlug].some(slug =>
        slug === normalizedTopic ||
        slug.includes(normalizedTopic) ||
        normalizedTopic.includes(slug)
      );
      // Very flexible time matching for secondary results
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 20) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 20);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      
      return matchesTopic && timeMatch && notInHistory && source.published && languageMatch;
    });

    console.log('🔄 Secondary filter results:', secondaryFilter.length);

    if (secondaryFilter.length > 0) {
      return secondaryFilter;
    }

    // Tertiary filter: related topics with flexible time
    const relatedTopics = getRelatedTopics(normalizedTopic);
    console.log('🔗 Related topics for', normalizedTopic, ':', relatedTopics);
    
    const tertiaryFilter = sources.filter(source => {
      const categorySlug = normalizeTopic(source.category);
      const subSlug = normalizeTopic(source.subcategory || '');
      const matchesRelated = relatedTopics.includes(categorySlug) ||
                            relatedTopics.includes(subSlug);
      const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 20) && 
                       config.timeSelected <= (source.max_time || source.estimated_time + 20);
      const notInHistory = !sourceHistory.includes(source.id);
      const languageMatch = source.language_preference === 'both' || 
                           source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
      
      return matchesRelated && timeMatch && notInHistory && source.published && languageMatch;
    });

    console.log('🎯 Tertiary filter results:', tertiaryFilter.length);

    if (tertiaryFilter.length > 0) {
      return tertiaryFilter;
    }

    // Final fallback: any published source not in history, sorted by time proximity
    const fallbackSources = sources.filter(source =>
      !sourceHistory.includes(source.id) && source.published
    );

    console.log('🆘 Fallback sources available:', fallbackSources.length);

    if (fallbackSources.length === 0) {
      return [];
    }

    // Sort by time proximity and return top 5
    return fallbackSources.sort((a, b) => {
      const aTimeDiff = Math.abs(a.estimated_time - config.timeSelected);
      const bTimeDiff = Math.abs(b.estimated_time - config.timeSelected);
      return aTimeDiff - bTimeDiff;
    }).slice(0, 5);
  }, [sources, config, sourceHistory]);



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
