import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Language } from "./LanguageToggle";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  PenTool, 
  ExternalLink,
  Trash2,
  Share
} from "lucide-react";

interface LearningJournalProps {
  language: Language;
  onBack: () => void;
}

interface EnrichedLearningSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration?: number;
  status: 'saved' | 'reflected';
  reflection?: string;
  tags?: string[];
  sefariaLink: string;
  sourceId?: string;
  excerpt?: string;
}

const content = {
  en: {
    title: "Learning Journal",
    subtitle: "Your Torah learning journey",
    backButton: "Back",
    tabs: {
      saved: "Saved", 
      reflected: "With Reflections"
    },
    actions: {
      revisit: "Revisit Reflection",
      delete: "Delete Session",
      share: "Share Source",
      edit: "Edit Reflection",
      openSefaria: "Open in Sefaria"
    },
    filters: {
      all: "All Topics",
      recent: "Recent First",
      oldest: "Oldest First"
    },
    empty: {
      saved: "No saved sources yet. Explicitly save sources during learning to access them later.",
      reflected: "No reflections yet. Write reflections to deepen your learning experience."
    },
    duration: "min",
    ago: "ago"
  },
  he: {
    title: "יומן הלימוד",
    subtitle: "מסע הלימוד התורני שלך",
    backButton: "חזור",
    tabs: {
      saved: "נשמר",
      reflected: "עם הרהורים"
    },
    actions: {
      revisit: "חזור להרהור",
      delete: "מחק סשן",
      share: "שתף מקור",
      edit: "ערוך הרהור", 
      openSefaria: "פתח בספריא"
    },
    filters: {
      all: "כל הנושאים",
      recent: "חדשים ראשון",
      oldest: "ישנים ראשון"
    },
    empty: {
      saved: "אין עדיין מקורות שמורים במפורש. שמור מקורות במהלך הלימוד כדי לגשת אליהם מאוחר יותר.",
      reflected: "אין עדיין הרהורים. כתוב הרהורים כדי להעמיק את חוויית הלימוד שלך."
    },
    duration: "דק׳",
    ago: "לפני"
  }
};


export const LearningJournal = ({ language, onBack }: LearningJournalProps) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'reflected'>('saved');
  const [enrichedSessions, setEnrichedSessions] = useState<EnrichedLearningSession[]>([]);
  
  const [dataLoading, setDataLoading] = useState(true);
  const { user } = useAuth();
  const { reflections, loading } = useSupabaseData();
  const { toast } = useToast();
  const t = content[language];
  const isHebrew = language === 'he';

  // Fetch saved sources and reflections
  const fetchData = useCallback(async () => {
    if (!user) return;
    
    setDataLoading(true);
    try {
      // Fetch explicitly saved sources
      const { data: savedData, error: savedError } = await supabase
        .from('saved_sources')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_saved', true)
        .order('saved_at', { ascending: false });

      if (savedError) throw savedError;

      // Create enriched sessions for saved sources
      const enrichedSaved: EnrichedLearningSession[] = (savedData || []).map(saved => ({
        id: saved.id,
        title: language === 'he' ? (saved.source_title_he || saved.source_title) : saved.source_title,
        topic: saved.topic_selected,
        date: saved.saved_at,
        status: 'saved' as const,
        sefariaLink: saved.sefaria_link || '',
        sourceId: saved.source_id || undefined,
        excerpt: (language === 'he' ? saved.source_excerpt_he : saved.source_excerpt) || undefined
      }));

      // Create enriched sessions for reflections
      const enrichedReflected: EnrichedLearningSession[] = reflections.map(reflection => ({
        id: reflection.id,
        title: reflection.session_id || 'Reflection',
        topic: 'Reflection',
        date: reflection.created_at || new Date().toISOString(),
        status: 'reflected' as const,
        reflection: reflection.note,
        tags: reflection.tags || [],
        sefariaLink: ''
      }));

      setEnrichedSessions([...enrichedSaved, ...enrichedReflected]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user, reflections, language]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredSessions = enrichedSessions.filter(session => {
    switch (activeTab) {
      case 'saved':
        return session.status === 'saved';
      case 'reflected':
        return session.status === 'reflected';
      default:
        return true;
    }
  });

  const handleDeleteItem = useCallback(async (itemId: string) => {
    try {
      const session = enrichedSessions.find(s => s.id === itemId);
      if (!session) return;

      if (session.status === 'saved') {
        // Delete from saved_sources
        const { error } = await supabase
          .from('saved_sources')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user?.id || '');

        if (error) throw error;

        
        toast({
          title: "Saved source removed",
          description: "Source has been removed from your saved list"
        });
      } else if (session.status === 'reflected') {
        // Delete from reflections
        const { error } = await supabase
          .from('reflections')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user?.id || '');

        if (error) throw error;

        toast({
          title: "Reflection deleted",
          description: "Reflection has been removed"
        });
      }

      setEnrichedSessions(prev => prev.filter(s => s.id !== itemId));
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [user?.id, toast, enrichedSessions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'learned':
        return <BookOpen className="h-4 w-4 text-primary" />;
      case 'saved':
        return <Heart className="h-4 w-4 text-accent" />;
      case 'reflected':
        return <PenTool className="h-4 w-4 text-primary" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return language === 'he' ? 'היום' : 'Today';
    if (diffDays === 2) return language === 'he' ? 'אתמול' : 'Yesterday';
    return `${diffDays} ${language === 'he' ? 'ימים' : 'days'} ${t.ago}`;
  };

  return (
    <div className={`min-h-screen bg-gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
      <div className="max-w-6xl mx-auto py-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.backButton}
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="saved">{t.tabs.saved}</TabsTrigger>
            <TabsTrigger value="reflected">{t.tabs.reflected}</TabsTrigger>
          </TabsList>


          <TabsContent value="saved">
            <div className="space-y-4">
              {loading || dataLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="learning-card">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredSessions.length === 0 ? (
                <Card className="learning-card text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.empty.saved}</p>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} className="learning-card hover:shadow-warm transition-smooth">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(session.status)}
                          <h3 className="text-lg font-semibold text-foreground">
                            {session.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <span>{session.topic}</span>
                          <span>•</span>
                          <span>{formatDate(session.date)}</span>
                        </div>

                        {session.excerpt && (
                          <p className="text-foreground/80 mb-3 text-sm">
                            "{session.excerpt.substring(0, 150)}..."
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {session.sefariaLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(session.sefariaLink, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(session.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="reflected">
            <div className="space-y-4">
              {loading || dataLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="learning-card">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : filteredSessions.length === 0 ? (
                <Card className="learning-card text-center py-12">
                  <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.empty.reflected}</p>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} className="learning-card hover:shadow-warm transition-smooth">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(session.status)}
                          <h3 className="text-lg font-semibold text-foreground">
                            {session.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                          <span>{session.topic}</span>
                          <span>•</span>
                          <span>{formatDate(session.date)}</span>
                        </div>

                        {session.reflection && (
                          <p className="text-foreground/80 mb-3 italic">
                            "{session.reflection}"
                          </p>
                        )}

                        {session.tags && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {session.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {session.sefariaLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(session.sefariaLink, '_blank')}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <PenTool className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(session.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};