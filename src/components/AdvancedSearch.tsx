import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  Tag,
  BookOpen,
  Clock
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Language } from './LanguageToggle';

interface AdvancedSearchProps {
  language: Language;
  onResults: (results: any[]) => void;
}

const content = {
  en: {
    searchPlaceholder: 'Search sources, reflections, topics...',
    filters: 'Filters',
    sortBy: 'Sort by',
    dateRange: 'Date Range',
    topics: 'Topics',
    status: 'Status',
    clear: 'Clear',
    apply: 'Apply',
    results: 'results found',
    noResults: 'No results found',
    sortOptions: {
      recent: 'Most Recent',
      oldest: 'Oldest First',
      duration: 'Study Duration',
      topic: 'Topic A-Z'
    },
    statusOptions: {
      all: 'All Sessions',
      learned: 'Learned',
      saved: 'Saved',
      reflected: 'Reflected'
    }
  },
  he: {
    searchPlaceholder: 'חפש מקורות, הרהורים, נושאים...',
    filters: 'מסננים',
    sortBy: 'מיין לפי',
    dateRange: 'טווח תאריכים',
    topics: 'נושאים',
    status: 'סטטוס',
    clear: 'נקה',
    apply: 'החל',
    results: 'תוצאות נמצאו',
    noResults: 'לא נמצאו תוצאות',
    sortOptions: {
      recent: 'האחרונים',
      oldest: 'הישנים ביותר',
      duration: 'משך לימוד',
      topic: 'נושא א-ת'
    },
    statusOptions: {
      all: 'כל המפגשים',
      learned: 'נלמד',
      saved: 'נשמר',
      reflected: 'הורהר'
    }
  }
};

export function AdvancedSearch({ language, onResults }: AdvancedSearchProps) {
  const { state } = useAppContext();
  const { sessions } = state;
  const t = content[language];
  const isHebrew = language === 'he';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique topics from sessions
  const availableTopics = Array.from(new Set(sessions.map(s => s.topic)));

  // Search and filter logic
  useEffect(() => {
    let filtered = [...sessions];

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(session =>
        session.sourceTitle.toLowerCase().includes(query) ||
        session.topic.toLowerCase().includes(query) ||
        session.reflection?.toLowerCase().includes(query) ||
        session.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Topic filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(session => 
        selectedTopics.includes(session.topic)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(session => session.status === selectedStatus);
    }

    // Sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'duration':
        filtered.sort((a, b) => b.timeSpent - a.timeSpent);
        break;
      case 'topic':
        filtered.sort((a, b) => a.topic.localeCompare(b.topic));
        break;
    }

    onResults(filtered);
  }, [searchQuery, selectedTopics, selectedStatus, sortBy, sessions, onResults]);

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopics([]);
    setSelectedStatus('all');
    setSortBy('recent');
  };

  return (
    <div className={`space-y-4 ${isHebrew ? 'text-right' : 'text-left'}`}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t.filters}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortBy(sortBy === 'recent' ? 'oldest' : 'recent')}
          className="flex items-center gap-2"
        >
          {sortBy === 'recent' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          {t.sortOptions[sortBy as keyof typeof t.sortOptions]}
        </Button>

        {(searchQuery || selectedTopics.length > 0 || selectedStatus !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive"
          >
            {t.clear}
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          {/* Sort Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">{t.sortBy}</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(t.sortOptions).map(([key, label]) => (
                <Button
                  key={key}
                  variant={sortBy === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(key)}
                  className="justify-start"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">{t.status}</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(t.statusOptions).map(([key, label]) => (
                <Button
                  key={key}
                  variant={selectedStatus === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(key)}
                  className="justify-start"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Topics Filter */}
          {availableTopics.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t.topics}</label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <Badge
                    key={topic}
                    variant={selectedTopics.includes(topic) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTopic(topic)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Active Filters Display */}
      {(selectedTopics.length > 0 || selectedStatus !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {selectedStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t.statusOptions[selectedStatus as keyof typeof t.statusOptions]}
              <button onClick={() => setSelectedStatus('all')} className="ml-1">×</button>
            </Badge>
          )}
          {selectedTopics.map((topic) => (
            <Badge key={topic} variant="secondary" className="flex items-center gap-1">
              {topic}
              <button onClick={() => toggleTopic(topic)} className="ml-1">×</button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}