import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/hooks/useSupabaseData";

interface LearningPattern {
  preferredTopics: Record<string, number>;
  timePreferences: Record<number, number>;
  difficultyProgression: 'beginner' | 'intermediate' | 'advanced';
  studyStreaks: {
    current: number;
    longest: number;
    lastStudyDate: string | null;
  };
  completionRates: Record<string, number>;
  optimalStudyTimes: number[];
}

interface UserAnalytics {
  totalSessions: number;
  totalReflections: number;
  averageSessionTime: number;
  favoriteCategories: string[];
  learningTrends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    consistencyScore: number;
  };
}

export const usePersonalizationEngine = () => {
  const { user } = useAuth();
  const [learningPattern, setLearningPattern] = useState<LearningPattern>({
    preferredTopics: {},
    timePreferences: {},
    difficultyProgression: 'beginner',
    studyStreaks: {
      current: 0,
      longest: 0,
      lastStudyDate: null
    },
    completionRates: {},
    optimalStudyTimes: [15, 20, 30]
  });
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalSessions: 0,
    totalReflections: 0,
    averageSessionTime: 0,
    favoriteCategories: [],
    learningTrends: {
      weeklyGrowth: 0,
      monthlyGrowth: 0,
      consistencyScore: 0
    }
  });

  // Analyze user learning patterns
  const analyzeLearningPatterns = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch user sessions
      const { data: sessions } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch user reflections
      const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id);

      if (!sessions || !reflections) return;

      // Analyze topic preferences
      const topicCounts: Record<string, number> = {};
      const timeCounts: Record<number, number> = {};
      let totalTime = 0;

      sessions.forEach(session => {
        topicCounts[session.topic_selected] = (topicCounts[session.topic_selected] || 0) + 1;
        timeCounts[session.time_selected] = (timeCounts[session.time_selected] || 0) + 1;
        totalTime += session.time_selected;
      });

      // Calculate study streaks
      const sortedSessions = sessions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      let lastStudyDate: string | null = null;

      if (sortedSessions.length > 0) {
        lastStudyDate = sortedSessions[0].created_at;
        const today = new Date();
        const lastStudy = new Date(sortedSessions[0].created_at);
        
        // Check if studied today or yesterday
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          currentStreak = 1;
        }

        // Calculate longest streak
        for (let i = 0; i < sortedSessions.length - 1; i++) {
          const current = new Date(sortedSessions[i].created_at);
          const next = new Date(sortedSessions[i + 1].created_at);
          const diff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diff <= 1) {
            tempStreak++;
            if (i === 0) currentStreak = tempStreak + 1;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak + 1);
            tempStreak = 0;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak + 1);
      }

      // Determine difficulty progression based on completion patterns
      let difficultyProgression: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      const completedSessions = sessions.filter(s => s.status === 'learned' || s.status === 'reflected');
      if (completedSessions.length > 10) {
        difficultyProgression = 'intermediate';
      }
      if (completedSessions.length > 25 && reflections.length > 15) {
        difficultyProgression = 'advanced';
      }

      // Calculate completion rates by topic
      const completionRates: Record<string, number> = {};
      Object.keys(topicCounts).forEach(topic => {
        const totalForTopic = topicCounts[topic];
        const completedForTopic = sessions.filter(s => 
          s.topic_selected === topic && (s.status === 'learned' || s.status === 'reflected')
        ).length;
        completionRates[topic] = totalForTopic > 0 ? completedForTopic / totalForTopic : 0;
      });

      // Update learning patterns
      setLearningPattern({
        preferredTopics: topicCounts,
        timePreferences: timeCounts,
        difficultyProgression,
        studyStreaks: {
          current: currentStreak,
          longest: longestStreak,
          lastStudyDate
        },
        completionRates,
        optimalStudyTimes: Object.keys(timeCounts)
          .sort((a, b) => timeCounts[Number(b)] - timeCounts[Number(a)])
          .slice(0, 3)
          .map(Number)
      });

      // Update analytics
      const averageTime = sessions.length > 0 ? totalTime / sessions.length : 0;
      const favoriteCategories = Object.keys(topicCounts)
        .sort((a, b) => topicCounts[b] - topicCounts[a])
        .slice(0, 3);

      setAnalytics({
        totalSessions: sessions.length,
        totalReflections: reflections.length,
        averageSessionTime: averageTime,
        favoriteCategories,
        learningTrends: {
          weeklyGrowth: calculateGrowthRate(sessions, 7),
          monthlyGrowth: calculateGrowthRate(sessions, 30),
          consistencyScore: calculateConsistencyScore(sessions)
        }
      });

    } catch (error) {
      console.error('Error analyzing learning patterns:', error);
    }
  }, [user]);

  // Calculate growth rate for a given period
  const calculateGrowthRate = (sessions: any[], days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentSessions = sessions.filter(s => 
      new Date(s.created_at) >= cutoffDate
    );
    
    const previousCutoff = new Date();
    previousCutoff.setDate(previousCutoff.getDate() - (days * 2));
    
    const previousSessions = sessions.filter(s => {
      const date = new Date(s.created_at);
      return date >= previousCutoff && date < cutoffDate;
    });
    
    if (previousSessions.length === 0) return recentSessions.length > 0 ? 100 : 0;
    
    return ((recentSessions.length - previousSessions.length) / previousSessions.length) * 100;
  };

  // Calculate consistency score based on study frequency
  const calculateConsistencyScore = (sessions: any[]) => {
    if (sessions.length < 7) return sessions.length * 10;
    
    const last30Days = sessions.filter(s => {
      const date = new Date(s.created_at);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return date >= cutoff;
    });
    
    const uniqueDays = new Set(
      last30Days.map(s => new Date(s.created_at).toDateString())
    ).size;
    
    return Math.min(100, (uniqueDays / 30) * 100);
  };

  // Get personalized source recommendations
  const getPersonalizedRecommendations = useCallback((sources: Source[], config: {
    timeSelected: number;
    topicSelected: string;
    language: 'en' | 'he';
  }) => {
    if (!sources.length) return [];

    return sources
      .filter(source => {
        // Basic filtering
        const topicMatch = source.category.toLowerCase() === config.topicSelected.toLowerCase();
        const timeMatch = config.timeSelected >= (source.min_time || source.estimated_time - 5) && 
                         config.timeSelected <= (source.max_time || source.estimated_time + 5);
        const languageMatch = source.language_preference === 'both' || 
                             source.language_preference === (config.language === 'he' ? 'hebrew' : 'english');
        const difficultyMatch = getDifficultyLevel(source.difficulty_level) <= getDifficultyLevel(learningPattern.difficultyProgression);
        
        return topicMatch && timeMatch && languageMatch && difficultyMatch && source.published;
      })
      .map(source => ({
        source,
        score: calculatePersonalizationScore(source, config)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.source);
  }, [learningPattern]);

  // Calculate personalization score for a source
  const calculatePersonalizationScore = (source: Source, config: any) => {
    let score = 0;
    
    // Topic preference weight
    const topicPreference = learningPattern.preferredTopics[source.category] || 0;
    score += topicPreference * 2;
    
    // Time preference weight
    const timePreference = learningPattern.timePreferences[config.timeSelected] || 0;
    score += timePreference * 1.5;
    
    // Difficulty progression bonus
    if (source.difficulty_level === learningPattern.difficultyProgression) {
      score += 3;
    }
    
    // Completion rate bonus for category
    const completionRate = learningPattern.completionRates[source.category] || 0;
    score += completionRate * 2;
    
    // Optimal time bonus
    if (learningPattern.optimalStudyTimes.includes(config.timeSelected)) {
      score += 1;
    }
    
    return score;
  };

  // Get difficulty level as number for comparison
  const getDifficultyLevel = (difficulty?: string) => {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    return levels[difficulty as keyof typeof levels] || 1;
  };

  // Get suggested study times based on user patterns
  const getSuggestedStudyTimes = useCallback(() => {
    if (learningPattern.optimalStudyTimes.length === 0) {
      return [15, 20, 30]; // Default suggestions
    }
    return learningPattern.optimalStudyTimes;
  }, [learningPattern.optimalStudyTimes]);

  // Get recommended topics based on user preferences and completion rates
  const getRecommendedTopics = useCallback(() => {
    const topics = Object.keys(learningPattern.preferredTopics);
    if (topics.length === 0) {
      return ['halacha', 'tanakh', 'talmud']; // Default topics
    }
    
    // Sort by completion rate and preference
    return topics.sort((a, b) => {
      const aScore = (learningPattern.preferredTopics[a] || 0) * (learningPattern.completionRates[a] || 0);
      const bScore = (learningPattern.preferredTopics[b] || 0) * (learningPattern.completionRates[b] || 0);
      return bScore - aScore;
    });
  }, [learningPattern]);

  // Update learning pattern after session completion
  const updateLearningPattern = useCallback((source: Source, action: 'completed' | 'skipped' | 'saved') => {
    if (action === 'completed') {
      setLearningPattern(prev => ({
        ...prev,
        preferredTopics: {
          ...prev.preferredTopics,
          [source.category]: (prev.preferredTopics[source.category] || 0) + 1
        },
        completionRates: {
          ...prev.completionRates,
          [source.category]: Math.min(1, (prev.completionRates[source.category] || 0) + 0.1)
        }
      }));
    }
  }, []);

  useEffect(() => {
    if (user) {
      analyzeLearningPatterns();
    }
  }, [user, analyzeLearningPatterns]);

  return {
    learningPattern,
    analytics,
    getPersonalizedRecommendations,
    getSuggestedStudyTimes,
    getRecommendedTopics,
    updateLearningPattern,
    analyzeLearningPatterns
  };
};