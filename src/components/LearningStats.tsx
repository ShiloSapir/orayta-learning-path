import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Star,
  Flame
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Language } from './LanguageToggle';

interface LearningStatsProps {
  language: Language;
}

const content = {
  en: {
    title: 'Learning Progress',
    todayGoal: "Today's Goal",
    currentStreak: 'Current Streak',
    totalSessions: 'Total Sessions',
    favoriteTopics: 'Favorite Topics',
    weeklyProgress: 'This Week',
    achievements: 'Recent Achievements',
    minutesStudied: 'minutes studied',
    sourcesRead: 'sources completed',
    reflectionsWritten: 'reflections written',
    days: 'days',
    sessions: 'sessions',
    completedToday: 'Completed today!',
    keepGoing: 'Keep going!'
  },
  he: {
    title: 'התקדמות בלימוד',
    todayGoal: 'יעד היום',
    currentStreak: 'רצף נוכחי',
    totalSessions: 'סה"כ מפגשים',
    favoriteTopics: 'נושאים מועדפים',
    weeklyProgress: 'השבוע',
    achievements: 'הישגים אחרונים',
    minutesStudied: 'דקות למדת',
    sourcesRead: 'מקורות הושלמו',
    reflectionsWritten: 'הרהורים נכתבו',
    days: 'ימים',
    sessions: 'מפגשים',
    completedToday: 'הושלם היום!',
    keepGoing: 'המשך כך!'
  }
};

export function LearningStats({ language }: LearningStatsProps) {
  const { state } = useAppContext();
  const { sessions, user } = state;
  const t = content[language];
  const isHebrew = language === 'he';

  // Calculate stats from sessions
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
  const reflectionCount = sessions.filter(s => s.reflection).length;
  const dailyGoal = user.preferences.dailyGoal;

  // Calculate today's progress
  const today = new Date().toDateString();
  const todaySessions = sessions.filter(s => s.createdAt.toDateString() === today);
  const todayMinutes = todaySessions.reduce((sum, session) => sum + session.timeSpent, 0);
  const goalProgress = Math.min((todayMinutes / dailyGoal) * 100, 100);

  // Calculate streak (simplified)
  const currentStreak = calculateStreak(sessions);

  // Get favorite topics
  const topicCounts = sessions.reduce((acc, session) => {
    acc[session.topic] = (acc[session.topic] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);

  // Mock achievements
  const achievements = [
    { icon: Star, text: t.completedToday, earned: goalProgress >= 100 },
    { icon: Flame, text: t.keepGoing, earned: currentStreak >= 3 },
    { icon: BookOpen, text: '10 ' + t.sourcesRead, earned: totalSessions >= 10 }
  ];

  return (
    <div className={`space-y-6 ${isHebrew ? 'text-right' : 'text-left'}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.title}</h2>
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            {totalMinutes} {t.minutesStudied}
          </span>
        </div>
      </div>

      {/* Today's Goal */}
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{t.todayGoal}</h3>
          <Badge variant={goalProgress >= 100 ? "default" : "secondary"}>
            {todayMinutes}/{dailyGoal} min
          </Badge>
        </div>
        <Progress value={goalProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-2">
          {goalProgress >= 100 ? t.completedToday : `${Math.round(goalProgress)}% complete`}
        </p>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <Flame className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <div className="font-bold text-lg">{currentStreak}</div>
          <div className="text-sm text-muted-foreground">{t.currentStreak}</div>
        </Card>
        
        <Card className="p-4 text-center">
          <Calendar className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="font-bold text-lg">{totalSessions}</div>
          <div className="text-sm text-muted-foreground">{t.totalSessions}</div>
        </Card>

        <Card className="p-4 text-center">
          <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="font-bold text-lg">{reflectionCount}</div>
          <div className="text-sm text-muted-foreground">{t.reflectionsWritten}</div>
        </Card>
      </div>

      {/* Favorite Topics */}
      {favoriteTopics.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t.favoriteTopics}
          </h3>
          <div className="flex flex-wrap gap-2">
            {favoriteTopics.map((topic) => (
              <Badge key={topic} variant="outline">
                {topic} ({topicCounts[topic]})
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Achievements */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {t.achievements}
        </h3>
        <div className="space-y-2">
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`flex items-center gap-3 p-2 rounded ${
                achievement.earned 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted/50 text-muted-foreground'
              }`}
            >
              <achievement.icon className="h-4 w-4" />
              <span className="text-sm">{achievement.text}</span>
              {achievement.earned && (
                <Badge variant="default" className="ml-auto text-xs">
                  Earned!
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function calculateStreak(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  // Check each day going backwards
  for (let i = 0; i < 30; i++) { // Check last 30 days max
    const dayString = currentDate.toDateString();
    const hasSessionOnDay = sortedSessions.some(session => 
      session.createdAt.toDateString() === dayString
    );
    
    if (hasSessionOnDay) {
      streak++;
    } else if (streak > 0) {
      // If we found sessions but this day has none, break the streak
      break;
    }
    
    // Go to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return streak;
}