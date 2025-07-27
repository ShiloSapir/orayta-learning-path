import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Language } from "./LanguageToggle";
import { 
  ArrowLeft, 
  BookOpen, 
  Heart, 
  PenTool, 
  Calendar,
  ExternalLink,
  Trash2,
  RotateCcw,
  Share
} from "lucide-react";

interface LearningJournalProps {
  language: Language;
  onBack: () => void;
}

interface LearningSession {
  id: string;
  title: string;
  topic: string;
  date: string;
  duration: number;
  status: 'learned' | 'saved' | 'reflected';
  reflection?: string;
  tags?: string[];
  sefariaLink: string;
}

const content = {
  en: {
    title: "Learning Journal",
    subtitle: "Your Torah learning journey",
    backButton: "Back",
    tabs: {
      learned: "Learned",
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
      learned: "No completed learning sessions yet. Start learning to see them here!",
      saved: "No saved sources yet. Save sources during learning to access them later.",
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
      learned: "נלמד",
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
      learned: "אין עדיין סשני לימוד שהושלמו. התחל ללמוד כדי לראות אותם כאן!",
      saved: "אין עדיין מקורות שמורים. שמור מקורות במהלך הלימוד כדי לגשת אליהם מאוחר יותר.",
      reflected: "אין עדיין הרהורים. כתוב הרהורים כדי להעמיק את חוויית הלימוד שלך."
    },
    duration: "דק׳",
    ago: "לפני"
  }
};

// Mock data
const mockSessions: LearningSession[] = [
  {
    id: "1",
    title: "Pirkei Avot 2:13 – Who is Wise?",
    topic: "Ethics",
    date: "2024-01-15",
    duration: 15,
    status: "reflected",
    reflection: "This teaching really opened my eyes to the importance of intellectual humility...",
    tags: ["Inspiring", "Ethical"],
    sefariaLink: "https://www.sefaria.org/Pirkei_Avot.2.13"
  },
  {
    id: "2", 
    title: "Shulchan Aruch OC 1:1 – Morning Awakening",
    topic: "Halacha",
    date: "2024-01-12",
    duration: 10,
    status: "learned",
    sefariaLink: "https://www.sefaria.org/Shulchan_Arukh%2C_Orach_Chayim.1.1"
  },
  {
    id: "3",
    title: "Mishneh Torah Hilchot Teshuva 7:3",
    topic: "Rambam", 
    date: "2024-01-10",
    duration: 20,
    status: "saved",
    sefariaLink: "https://www.sefaria.org/Mishneh_Torah%2C_Repentance.7.3"
  }
];

export const LearningJournal = ({ language, onBack }: LearningJournalProps) => {
  const [activeTab, setActiveTab] = useState<'learned' | 'saved' | 'reflected'>('learned');
  const [storedSessions, setStoredSessions] = useState<LearningSession[]>([]);
  const t = content[language];
  const isHebrew = language === 'he';

  useEffect(() => {
    const stored = localStorage.getItem('orayta_sessions');
    if (stored) {
      setStoredSessions(JSON.parse(stored));
    }
  }, []);

  const allSessions = [...storedSessions, ...mockSessions];

  const filteredSessions = allSessions.filter(session => {
    switch (activeTab) {
      case 'learned':
        return session.status === 'learned' || session.status === 'reflected';
      case 'saved':
        return session.status === 'saved';
      case 'reflected':
        return session.status === 'reflected';
      default:
        return true;
    }
  });

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
    <div className={`min-h-screen gradient-subtle p-4 pb-20 ${isHebrew ? 'hebrew' : ''}`}>
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="learned">{t.tabs.learned}</TabsTrigger>
            <TabsTrigger value="saved">{t.tabs.saved}</TabsTrigger>
            <TabsTrigger value="reflected">{t.tabs.reflected}</TabsTrigger>
          </TabsList>

          <TabsContent value="learned">
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <Card className="learning-card text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.empty.learned}</p>
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
                          <span>{session.duration} {t.duration}</span>
                          <span>•</span>
                          <span>{formatDate(session.date)}</span>
                        </div>

                        {session.reflection && (
                          <p className="text-foreground/80 mb-3 italic">
                            {session.reflection.substring(0, 100)}...
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(session.sefariaLink, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        {session.reflection && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
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

          <TabsContent value="saved">
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
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
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(session.sefariaLink, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
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
              {filteredSessions.length === 0 ? (
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
                          <span>{session.duration} {t.duration}</span>
                          <span>•</span>
                          <span>{formatDate(session.date)}</span>
                        </div>

                        {session.reflection && (
                          <p className="text-foreground/80 mb-3 italic">
                            {session.reflection}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(session.sefariaLink, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
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