import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  BookOpen, 
  Star,
  TrendingUp,
  Tag,
  Sparkles,
  Brain,
  Heart
} from 'lucide-react';
import { useSupabaseData, Source } from '@/hooks/useSupabaseData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Language } from './LanguageToggle';

interface AdvancedSearchAndDiscoveryProps {
  language: Language;
  onSourceSelect?: (source: Source) => void;
  onBack?: () => void;
}

interface SearchResult {
  source: Source;
  relevanceScore: number;
  matchType: 'exact' | 'semantic' | 'related';
  highlights: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  sources: Source[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  category: string;
}

const content = {
  en: {
    title: 'Discover & Search',
    searchPlaceholder: 'Search Torah sources, topics, or concepts...',
    semanticSearch: 'Semantic Search',
    exactSearch: 'Exact Match',
    relatedSources: 'Related Sources',
    learningPaths: 'Learning Paths',
    recommendations: 'For You',
    filters: 'Filters',
    allCategories: 'All Categories',
    allDifficulties: 'All Levels',
    anyTime: 'Any Duration',
    results: 'results',
    noResults: 'No sources found. Try different search terms.',
    pathExplore: 'Explore Path',
    minutes: 'min',
    exactMatch: 'Exact match',
    semanticMatch: 'Similar concept',
    relatedMatch: 'Related topic',
    recentSearches: 'Recent Searches',
    popularTopics: 'Popular Topics',
    trendingNow: 'Trending Now',
    clearFilters: 'Clear Filters',
    searchHistory: 'Search History',
    suggestions: 'Suggestions',
    similar: 'Similar Sources',
    connections: 'Source Connections'
  },
  he: {
    title: 'גלה וחפש',
    searchPlaceholder: 'חפש מקורות תורניים, נושאים או מושגים...',
    semanticSearch: 'חיפוש סמנטי',
    exactSearch: 'התאמה מדויקת',
    relatedSources: 'מקורות קשורים',
    learningPaths: 'מסלולי למידה',
    recommendations: 'עבורך',
    filters: 'מסננים',
    allCategories: 'כל הקטגוריות',
    allDifficulties: 'כל הרמות',
    anyTime: 'כל משך זמן',
    results: 'תוצאות',
    noResults: 'לא נמצאו מקורות. נסה מילות חיפוש אחרות.',
    pathExplore: 'חקור מסלול',
    minutes: 'דק',
    exactMatch: 'התאמה מדויקת',
    semanticMatch: 'מושג דומה',
    relatedMatch: 'נושא קשור',
    recentSearches: 'חיפושים אחרונים',
    popularTopics: 'נושאים פופולריים',
    trendingNow: 'טרנדיים עכשיו',
    clearFilters: 'נקה מסננים',
    searchHistory: 'היסטוריית חיפוש',
    suggestions: 'הצעות',
    similar: 'מקורות דומים',
    connections: 'קשרים בין מקורות'
  }
};

export function AdvancedSearchAndDiscovery({ language, onSourceSelect, onBack }: AdvancedSearchAndDiscoveryProps) {
  const { user } = useAuth();
  const { sources } = useSupabaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<Source[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularTopics, setPopularTopics] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    timeRange: '',
    searchType: 'semantic' as 'exact' | 'semantic' | 'related'
  });
  const [selectedTab, setSelectedTab] = useState('search');
  
  const t = content[language];
  const isHebrew = language === 'he';

  useEffect(() => {
    loadInitialData();
    loadUserSearchHistory();
  }, [user]);

  const loadInitialData = async () => {
    await Promise.all([
      loadLearningPaths(),
      loadPersonalizedRecommendations(),
      loadPopularTopics()
    ]);
  };

  const loadUserSearchHistory = async () => {
    if (!user) return;
    
    const saved = localStorage.getItem(`search_history_${user.id}`);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  };

  const saveSearchToHistory = (query: string) => {
    if (!user || !query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem(`search_history_${user.id}`, JSON.stringify(updated));
  };

  const loadLearningPaths = async () => {
    // Generate curated learning paths based on source relationships
    const paths: LearningPath[] = [
      {
        id: 'halacha-basics',
        title: isHebrew ? 'יסודות ההלכה' : 'Foundations of Halacha',
        description: isHebrew ? 'מסלול למידה בסיסי בהלכה יומיומית' : 'Basic pathway through daily Jewish law',
        sources: sources.filter(s => s.category === 'halacha' && s.difficulty_level === 'beginner').slice(0, 5),
        difficulty: 'beginner',
        estimatedDuration: 75,
        category: 'halacha'
      },
      {
        id: 'tanakh-journey',
        title: isHebrew ? 'מסע בתנ"ך' : 'Journey Through Tanakh',
        description: isHebrew ? 'חקר מקורות תנ"כיים מרכזיים' : 'Explore key biblical sources',
        sources: sources.filter(s => s.category === 'tanakh').slice(0, 6),
        difficulty: 'intermediate',
        estimatedDuration: 90,
        category: 'tanakh'
      },
      {
        id: 'spiritual-growth',
        title: isHebrew ? 'צמיחה רוחנית' : 'Spiritual Growth',
        description: isHebrew ? 'מקורות לחיזוק רוחני ואישי' : 'Sources for spiritual and personal development',
        sources: sources.filter(s => s.category === 'spiritual').slice(0, 4),
        difficulty: 'beginner',
        estimatedDuration: 60,
        category: 'spiritual'
      }
    ];
    
    setLearningPaths(paths);
  };

  const loadPersonalizedRecommendations = async () => {
    if (!user) return;

    // Get user's learning history
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('topic_selected, time_selected')
      .eq('user_id', user.id)
      .limit(20);

    if (sessions && sessions.length > 0) {
      // Analyze preferences
      const topicPreferences = sessions.reduce((acc, session) => {
        acc[session.topic_selected] = (acc[session.topic_selected] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgTime = sessions.reduce((sum, s) => sum + s.time_selected, 0) / sessions.length;
      
      // Find sources that match preferences
      const recommended = sources
        .filter(source => {
          const categoryMatch = topicPreferences[source.category] > 0;
          const timeMatch = Math.abs(source.estimated_time - avgTime) <= 10;
          return categoryMatch || timeMatch;
        })
        .sort(() => Math.random() - 0.5) // Shuffle for variety
        .slice(0, 8);

      setPersonalizedRecommendations(recommended);
    } else {
      // Fallback to popular sources for new users
      setPersonalizedRecommendations(
        sources.filter(s => s.published).slice(0, 8)
      );
    }
  };

  const loadPopularTopics = async () => {
    // Get most common topics from all sessions
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('topic_selected');

    if (sessions) {
      const topicCounts = sessions.reduce((acc, session) => {
        acc[session.topic_selected] = (acc[session.topic_selected] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const popular = Object.entries(topicCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 6)
        .map(([topic]) => topic);

      setPopularTopics(popular);
    }
  };

  const performSemanticSearch = useCallback((query: string, sources: Source[]): SearchResult[] => {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(' ').filter(term => term.length > 2);

    return sources
      .map(source => {
        let relevanceScore = 0;
        const highlights: string[] = [];
        let matchType: 'exact' | 'semantic' | 'related' = 'related';

        const searchableText = [
          source.title,
          source.title_he,
          source.text_excerpt,
          source.text_excerpt_he,
          source.reflection_prompt,
          source.reflection_prompt_he,
          source.category,
          source.subcategory,
          ...(source.commentaries || []),
          ...(source.learning_objectives || [])
        ].filter(Boolean).join(' ').toLowerCase();

        // Exact matches get highest score
        if (searchableText.includes(queryLower)) {
          relevanceScore += 100;
          matchType = 'exact';
          highlights.push('Exact match found');
        }

        // Individual term matches
        queryTerms.forEach(term => {
          if (searchableText.includes(term)) {
            relevanceScore += 20;
            if (matchType === 'related') matchType = 'semantic';
          }
        });

        // Category/topic matches
        if (source.category.toLowerCase().includes(queryLower)) {
          relevanceScore += 50;
          highlights.push(`Category: ${source.category}`);
        }

        // Title matches get bonus
        if ((source.title?.toLowerCase() || '').includes(queryLower) || 
            (source.title_he?.toLowerCase() || '').includes(queryLower)) {
          relevanceScore += 30;
          highlights.push('Title match');
        }

        // Difficulty and time relevance
        if (filters.difficulty && source.difficulty_level === filters.difficulty) {
          relevanceScore += 10;
        }

        return {
          source,
          relevanceScore,
          matchType,
          highlights
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [filters]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    saveSearchToHistory(query);

    // Filter sources based on current filters
    let filteredSources = sources.filter(source => source.published);

    if (filters.category) {
      filteredSources = filteredSources.filter(s => s.category === filters.category);
    }

    if (filters.difficulty) {
      filteredSources = filteredSources.filter(s => s.difficulty_level === filters.difficulty);
    }

    if (filters.timeRange) {
      const [min, max] = filters.timeRange.split('-').map(Number);
      filteredSources = filteredSources.filter(s => 
        s.estimated_time >= min && s.estimated_time <= max
      );
    }

    const results = performSemanticSearch(query, filteredSources);
    setSearchResults(results);
  }, [sources, filters, performSemanticSearch, saveSearchToHistory]);

  const getSimilarSources = (source: Source): Source[] => {
    return sources
      .filter(s => 
        s.id !== source.id && 
        s.published &&
        (s.category === source.category || 
         s.difficulty_level === source.difficulty_level ||
         Math.abs(s.estimated_time - source.estimated_time) <= 5)
      )
      .slice(0, 3);
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'exact': return <Star className="h-3 w-3" />;
      case 'semantic': return <Brain className="h-3 w-3" />;
      default: return <Heart className="h-3 w-3" />;
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'exact': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'semantic': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20';
    }
  };

  const SearchResultCard = ({ result }: { result: SearchResult }) => {
    const { source, relevanceScore, matchType, highlights } = result;
    const title = isHebrew ? source.title_he : source.title;
    const similarSources = getSimilarSources(source);

    return (
      <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" 
            onClick={() => onSourceSelect?.(source)}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {source.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {source.difficulty_level}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {source.estimated_time} {t.minutes}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getMatchTypeColor(matchType)}`}>
                {getMatchTypeIcon(matchType)}
                <span className="ml-1">
                  {matchType === 'exact' ? t.exactMatch : 
                   matchType === 'semantic' ? t.semanticMatch : t.relatedMatch}
                </span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Math.round(relevanceScore)}%
              </span>
            </div>
          </div>

          {/* Content Preview */}
          {(source.text_excerpt || source.text_excerpt_he) && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {isHebrew ? source.text_excerpt_he : source.text_excerpt}
            </p>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {highlights.map((highlight, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          )}

          {/* Similar Sources */}
          {similarSources.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-1">{t.similar}:</p>
              <div className="flex gap-1">
                {similarSources.map(similar => (
                  <Badge key={similar.id} variant="outline" className="text-xs">
                    {isHebrew ? similar.title_he : similar.title}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const LearningPathCard = ({ path }: { path: LearningPath }) => (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{path.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
          </div>
          <Badge variant="outline">{path.difficulty}</Badge>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {path.sources.length} sources
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {path.estimatedDuration} {t.minutes}
          </span>
        </div>
        
        <Button variant="outline" size="sm" className="w-full">
          <TrendingUp className="h-3 w-3 mr-2" />
          {t.pathExplore}
        </Button>
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${isHebrew ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="text-center">
        {onBack && (
          <div className="flex justify-start mb-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              ← Back
            </Button>
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted-foreground">
          Discover personalized Torah learning experiences
        </p>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10"
            />
            <Button 
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7"
              size="sm"
            >
              Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-1 text-sm border rounded"
            >
              <option value="">{t.allCategories}</option>
              <option value="halacha">Halacha</option>
              <option value="tanakh">Tanakh</option>
              <option value="talmud">Talmud</option>
              <option value="spiritual">Spiritual</option>
            </select>

            <select 
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="px-3 py-1 text-sm border rounded"
            >
              <option value="">{t.allDifficulties}</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select 
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="px-3 py-1 text-sm border rounded"
            >
              <option value="">{t.anyTime}</option>
              <option value="5-15">5-15 min</option>
              <option value="15-30">15-30 min</option>
              <option value="30-60">30-60 min</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ category: '', difficulty: '', timeRange: '', searchType: 'semantic' })}
            >
              {t.clearFilters}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="paths">{t.learningPaths}</TabsTrigger>
          <TabsTrigger value="recommendations">{t.recommendations}</TabsTrigger>
          <TabsTrigger value="trending">{t.trendingNow}</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {searchResults.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {searchResults.length} {t.results} for "{searchQuery}"
              </p>
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <SearchResultCard key={result.source.id} result={result} />
                ))}
              </div>
            </>
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t.noResults}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">{t.recentSearches}</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch(search);
                        }}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Topics */}
              {popularTopics.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">{t.popularTopics}</h3>
                  <div className="flex flex-wrap gap-2">
                    {popularTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          setSearchQuery(topic);
                          handleSearch(topic);
                        }}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningPaths.map(path => (
              <LearningPathCard key={path.id} path={path} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalizedRecommendations.map(source => (
              <Card key={source.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSourceSelect?.(source)}>
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    {isHebrew ? source.title_he : source.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{source.category}</Badge>
                    <Badge variant="outline" className="text-xs">{source.difficulty_level}</Badge>
                    <Badge variant="outline" className="text-xs">{source.estimated_time} min</Badge>
                  </div>
                  {(source.text_excerpt || source.text_excerpt_he) && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {isHebrew ? source.text_excerpt_he : source.text_excerpt}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Trending content will be available soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}