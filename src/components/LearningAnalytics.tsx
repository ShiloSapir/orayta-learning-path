import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LearningStats } from './LearningStats';
import { 
  BarChart, 
  Calendar, 
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Star
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Language } from './LanguageToggle';

interface LearningAnalyticsProps {
  language: Language;
}

const content = {
  en: {
    title: 'Learning Analytics',
    overview: 'Overview',
    progress: 'Progress',
    learningInsights: 'Insights',
    goals: 'Goals',
    search: 'Search',
    weeklyGoal: 'Weekly Goal',
    monthlyGoal: 'Monthly Goal',
    streakTarget: 'Streak Target',
    topicGoal: 'Topics to Explore',
    currentWeek: 'This Week',
    currentMonth: 'This Month',
    learningVelocity: 'Learning Velocity',
    favoriteTime: 'Favorite Learning Time',
    averageSession: 'Average Session',
    completionRate: 'Completion Rate',
    insightsData: {
      title: 'Personalized Insights',
      consistency: 'Your most consistent learning time is in the morning',
      preference: 'You show strong interest in Halacha topics',
      suggestion: 'Consider exploring Chassidut to broaden your perspective',
      streak: 'You\'re 2 days away from your personal best streak!'
    }
  },
  he: {
    title: 'ניתוח למידה',
    overview: 'סקירה',
    progress: 'התקדמות',
    learningInsights: 'תובנות',
    goals: 'יעדים',
    search: 'חיפוש',
    weeklyGoal: 'יעד שבועי',
    monthlyGoal: 'יעד חודשי',
    streakTarget: 'יעד רצף',
    topicGoal: 'נושאים לחקר',
    currentWeek: 'השבוע',
    currentMonth: 'החודש',
    learningVelocity: 'מהירות למידה',
    favoriteTime: 'זמן למידה מועדף',
    averageSession: 'מפגש ממוצע',
    completionRate: 'אחוז השלמה',
    insightsData: {
      title: 'תובנות אישיות',
      consistency: 'הזמן הקבוע ביותר ללמידה שלך הוא בבוקר',
      preference: 'אתה מגלה עניין רב בנושאי הלכה',
      suggestion: 'כדאי לחקור גם חסידות להרחבת האופקים',
      streak: 'אתה רק יומיים ממחקור הרצף האישי שלך!'
    }
  }
};

export function LearningAnalytics({ language }: LearningAnalyticsProps) {
  const { state } = useAppContext();
  const { sessions } = state;
  const [searchResults] = useState(sessions);
  const t = content[language];
  const isHebrew = language === 'he';

  // Calculate analytics
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, session) => sum + session.timeSpent, 0);
  const averageSessionTime = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  
  // Weekly progress
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
  const weekSessions = sessions.filter(s => s.createdAt >= thisWeek);
  const weekMinutes = weekSessions.reduce((sum, session) => sum + session.timeSpent, 0);
  
  // Goals (mock data)
  const goals = {
    weekly: { target: 105, current: weekMinutes }, // 15 min x 7 days
    monthly: { target: 450, current: totalMinutes },
    streak: { target: 7, current: 3 },
    topics: { target: 5, current: 3 }
  };

  const GoalCard = ({ icon: Icon, title, current, target, unit }: any) => {
    const percentage = Math.min((current / target) * 100, 100);
    
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold">{current}</span>
            <span className="text-sm text-muted-foreground">/ {target} {unit}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {Math.round(percentage)}% complete
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${isHebrew ? 'text-right' : 'text-left'}`}>
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
        <div className="flex items-center justify-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">
            {totalSessions} sessions • {totalMinutes} minutes
          </span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="progress">{t.progress}</TabsTrigger>
          <TabsTrigger value="insights">{t.learningInsights}</TabsTrigger>
          <TabsTrigger value="search">{t.search}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GoalCard
              icon={Target}
              title={t.weeklyGoal}
              current={weekMinutes}
              target={goals.weekly.target}
              unit="min"
            />
            <GoalCard
              icon={Calendar}
              title={t.monthlyGoal}
              current={totalMinutes}
              target={goals.monthly.target}
              unit="min"
            />
            <GoalCard
              icon={Star}
              title={t.streakTarget}
              current={goals.streak.current}
              target={goals.streak.target}
              unit="days"
            />
            <GoalCard
              icon={BookOpen}
              title={t.topicGoal}
              current={goals.topics.current}
              target={goals.topics.target}
              unit="topics"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="font-bold text-lg">{averageSessionTime} min</div>
              <div className="text-sm text-muted-foreground">{t.averageSession}</div>
            </Card>
            
            <Card className="p-4 text-center">
              <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="font-bold text-lg">9:00 AM</div>
              <div className="text-sm text-muted-foreground">{t.favoriteTime}</div>
            </Card>

            <Card className="p-4 text-center">
              <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="font-bold text-lg">92%</div>
              <div className="text-sm text-muted-foreground">{t.completionRate}</div>
            </Card>

            <Card className="p-4 text-center">
              <BookOpen className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="font-bold text-lg">2.1/day</div>
              <div className="text-sm text-muted-foreground">{t.learningVelocity}</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <LearningStats language={language} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {t.insightsData.title}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200">{t.insightsData.consistency}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">{t.insightsData.preference}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-purple-800 dark:text-purple-200">{t.insightsData.suggestion}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-orange-800 dark:text-orange-200">{t.insightsData.streak}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Note: AdvancedSearch component would need sources prop and different interface */}
          <div className="text-sm text-muted-foreground mb-4">
            Advanced search functionality will be integrated here
          </div>
          
          <div className="text-sm text-muted-foreground">
            {searchResults.length} {t.search.toLowerCase()} results
          </div>
          
          <div className="grid gap-4">
            {searchResults.slice(0, 10).map((session) => (
              <Card key={session.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{session.sourceTitle}</h3>
                  <span className="text-sm text-muted-foreground">
                    {session.timeSpent} min
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {session.topic} • {session.createdAt.toLocaleDateString()}
                </p>
                {session.reflection && (
                  <p className="text-sm italic text-muted-foreground">
                    "{session.reflection.substring(0, 100)}..."
                  </p>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}