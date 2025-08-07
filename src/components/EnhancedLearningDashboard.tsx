import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Clock,
  BookOpen,
  Star,
  Flame,
  Trophy,
  BarChart3,
  Activity,
  Zap,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizationEngine } from '@/hooks/usePersonalizationEngine';
import { supabase } from '@/integrations/supabase/client';
import { Language } from './LanguageToggle';

interface EnhancedLearningDashboardProps {
  language: Language;
  onBack?: () => void;
}

const content = {
  en: {
    title: 'Learning Dashboard',
    overview: 'Overview',
    insights: 'Insights',
    goals: 'Goals',
    streaks: 'Streaks',
    todaysGoal: "Today's Progress",
    weeklyGoal: 'Weekly Goal',
    monthlyGoal: 'Monthly Goal',
    currentStreak: 'Current Streak',
    longestStreak: 'Best Streak',
    totalSessions: 'Total Sessions',
    totalReflections: 'Reflections',
    averageTime: 'Avg. Session',
    favoriteTopics: 'Favorite Topics',
    learningVelocity: 'Learning Velocity',
    consistencyScore: 'Consistency',
    weeklyGrowth: 'Weekly Growth',
    monthlyGrowth: 'Monthly Growth',
    suggestions: 'Personalized Suggestions',
    minutes: 'min',
    days: 'days',
    sessions: 'sessions',
    hours: 'hours',
    percent: '%',
    keepLearning: 'Keep learning!',
    greatProgress: 'Great progress!',
    onTrack: 'On track',
    needsWork: 'Needs work',
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair'
  },
  he: {
    title: 'לוח מחוונים ללמידה',
    overview: 'סקירה',
    insights: 'תובנות',
    goals: 'יעדים',
    streaks: 'רצפים',
    todaysGoal: 'התקדמות היום',
    weeklyGoal: 'יעד שבועי',
    monthlyGoal: 'יעד חודשי',
    currentStreak: 'רצף נוכחי',
    longestStreak: 'הרצף הטוב ביותר',
    totalSessions: 'סה"כ מפגשים',
    totalReflections: 'הרהורים',
    averageTime: 'מפגש ממוצע',
    favoriteTopics: 'נושאים מועדפים',
    learningVelocity: 'מהירות למידה',
    consistencyScore: 'עקביות',
    weeklyGrowth: 'צמיחה שבועית',
    monthlyGrowth: 'צמיחה חודשית',
    suggestions: 'הצעות אישיות',
    minutes: 'דק',
    days: 'ימים',
    sessions: 'מפגשים',
    hours: 'שעות',
    percent: '%',
    keepLearning: 'המשך ללמוד!',
    greatProgress: 'התקדמות מעולה!',
    onTrack: 'במסלול הנכון',
    needsWork: 'זקוק לשיפור',
    excellent: 'מצוין',
    good: 'טוב',
    fair: 'בסדר'
  }
};

export function EnhancedLearningDashboard({ language, onBack }: EnhancedLearningDashboardProps) {
  const { user } = useAuth();
  const { learningPattern, analytics, getSuggestedStudyTimes, getRecommendedTopics } = usePersonalizationEngine();
  const [dailyData, setDailyData] = useState({
    todayMinutes: 0,
    todaySessions: 0,
    goalMinutes: 20,
    goalProgress: 0
  });
  const [achievements, setAchievements] = useState<any[]>([]);
  
  const t = content[language];
  const isHebrew = language === 'he';

  useEffect(() => {
    loadDailyProgress();
    loadAchievements();
  }, [user]);

  const loadDailyProgress = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('time_selected')
      .eq('user_id', user.id)
      .gte('created_at', today);

    const todayMinutes = sessions?.reduce((sum, s) => sum + s.time_selected, 0) || 0;
    const todaySessions = sessions?.length || 0;
    const goalMinutes = 20; // Default goal
    const goalProgress = Math.min((todayMinutes / goalMinutes) * 100, 100);

    setDailyData({ todayMinutes, todaySessions, goalMinutes, goalProgress });
  };

  const loadAchievements = () => {
    const newAchievements = [
      {
        id: 'daily_goal',
        icon: Target,
        title: 'Daily Goal',
        description: 'Complete daily learning goal',
        earned: dailyData.goalProgress >= 100,
        progress: dailyData.goalProgress
      },
      {
        id: 'week_streak',
        icon: Flame,
        title: 'Week Warrior',
        description: 'Learn for 7 days straight',
        earned: learningPattern.studyStreaks.current >= 7,
        progress: Math.min((learningPattern.studyStreaks.current / 7) * 100, 100)
      },
      {
        id: 'reflection_master',
        icon: MessageSquare,
        title: 'Reflection Master',
        description: 'Write 10 reflections',
        earned: analytics.totalReflections >= 10,
        progress: Math.min((analytics.totalReflections / 10) * 100, 100)
      },
      {
        id: 'consistency_champion',
        icon: Activity,
        title: 'Consistency Champion',
        description: 'Maintain 80% consistency',
        earned: analytics.learningTrends.consistencyScore >= 80,
        progress: analytics.learningTrends.consistencyScore
      }
    ];
    setAchievements(newAchievements);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };


  const StatCard = ({ icon: Icon, title, value, unit, subtitle, color = 'text-primary' }: any) => (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}{unit}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );

  const GoalCard = ({ title, current, target, unit, icon: Icon }: any) => {
    const percentage = Math.min((current / target) * 100, 100);
    const status = percentage >= 100 ? t.excellent : percentage >= 75 ? t.good : t.fair;
    
    return (
      <Card className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Icon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{title}</h3>
          <Badge variant={percentage >= 100 ? "default" : "secondary"}>
            {current}/{target} {unit}
          </Badge>
        </div>
        <Progress value={percentage} className="h-2 mb-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
          <span className={`text-sm ${getScoreColor(percentage)}`}>{status}</span>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-parchment mobile-container">
      <div className="max-w-4xl mx-auto mobile-scroll safe-bottom" style={{ maxHeight: 'calc(100vh - env(safe-area-inset-bottom, 0px) - 80px)' }}>
        <div className={`space-y-6 pb-20 ${isHebrew ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="text-center mb-6">
        {onBack && (
          <div className="flex justify-start mb-4">
            <Button variant="ghost" onClick={onBack} className="gap-2">
              ← Back
            </Button>
          </div>
        )}
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.title}</h1>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">
              {analytics.totalSessions} {t.sessions}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-muted-foreground">
              {learningPattern.studyStreaks.current} {t.days}
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="goals">{t.goals}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights}</TabsTrigger>
          <TabsTrigger value="streaks">{t.streaks}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Today's Progress */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t.todaysGoal}
            </h2>
            <div className="space-y-4">
              <Progress value={dailyData.goalProgress} className="h-3" />
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">
                  {dailyData.todayMinutes}/{dailyData.goalMinutes} {t.minutes}
                </span>
                <Badge variant={dailyData.goalProgress >= 100 ? "default" : "secondary"}>
                  {Math.round(dailyData.goalProgress)}%
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {dailyData.todaySessions} {t.sessions} {t.keepLearning}
              </p>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              title={t.totalSessions}
              value={analytics.totalSessions}
              unit=""
              color="text-blue-600"
            />
            <StatCard
              icon={MessageSquare}
              title={t.totalReflections}
              value={analytics.totalReflections}
              unit=""
              color="text-purple-600"
            />
            <StatCard
              icon={Clock}
              title={t.averageTime}
              value={Math.round(analytics.averageSessionTime)}
              unit={` ${t.minutes}`}
              color="text-green-600"
            />
            <StatCard
              icon={Activity}
              title={t.consistencyScore}
              value={Math.round(analytics.learningTrends.consistencyScore)}
              unit={`${t.percent}`}
              color={getScoreColor(analytics.learningTrends.consistencyScore)}
            />
          </div>

          {/* Favorite Topics */}
          {Object.keys(learningPattern.preferredTopics).length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {t.favoriteTopics}
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(learningPattern.preferredTopics)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([topic, count]) => (
                    <Badge key={topic} variant="outline" className="text-sm">
                      {topic} ({count})
                    </Badge>
                  ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GoalCard
              title={t.weeklyGoal}
              current={Math.round(analytics.totalSessions * 0.3)} // Approximate weekly
              target={5}
              unit={t.sessions}
              icon={Calendar}
            />
            <GoalCard
              title={t.monthlyGoal}
              current={analytics.totalSessions}
              target={20}
              unit={t.sessions}
              icon={Target}
            />
          </div>

          {/* Achievements */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? 'bg-primary/10 border-primary/20' 
                      : 'bg-muted/50 border-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <achievement.icon className={`h-6 w-6 mt-1 ${
                      achievement.earned ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <Progress value={achievement.progress} className="h-2" />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {Math.round(achievement.progress)}%
                        </span>
                        {achievement.earned && (
                          <Badge variant="default" className="text-xs">
                            Earned!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                {t.weeklyGrowth}
              </h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {analytics.learningTrends.weeklyGrowth >= 0 ? '+' : ''}{Math.round(analytics.learningTrends.weeklyGrowth)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.learningTrends.weeklyGrowth >= 0 ? t.greatProgress : t.needsWork}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                {t.monthlyGrowth}
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {analytics.learningTrends.monthlyGrowth >= 0 ? '+' : ''}{Math.round(analytics.learningTrends.monthlyGrowth)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.learningTrends.monthlyGrowth >= 0 ? t.onTrack : t.needsWork}
              </p>
            </Card>
          </div>

          {/* Personalized Suggestions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {t.suggestions}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Optimal Study Times
                </h4>
                <div className="flex gap-2">
                  {getSuggestedStudyTimes().map((time) => (
                    <Badge key={time} variant="outline" className="text-blue-700 dark:text-blue-300">
                      {time} {t.minutes}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Recommended Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getRecommendedTopics().slice(0, 3).map((topic) => (
                    <Badge key={topic} variant="outline" className="text-green-700 dark:text-green-300">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 text-center">
              <Flame className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-orange-500 mb-2">
                {learningPattern.studyStreaks.current}
              </div>
              <h3 className="font-semibold text-lg mb-1">{t.currentStreak}</h3>
              <p className="text-sm text-muted-foreground">
                {learningPattern.studyStreaks.current > 0 ? t.keepLearning : 'Start learning today!'}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-yellow-500 mb-2">
                {learningPattern.studyStreaks.longest}
              </div>
              <h3 className="font-semibold text-lg mb-1">{t.longestStreak}</h3>
              <p className="text-sm text-muted-foreground">
                Personal best record
              </p>
            </Card>
          </div>

          {/* Streak Progress */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Streak Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Next Milestone (7 days)</span>
                  <span>{learningPattern.studyStreaks.current}/7</span>
                </div>
                <Progress 
                  value={Math.min((learningPattern.studyStreaks.current / 7) * 100, 100)} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Goal Milestone (30 days)</span>
                  <span>{learningPattern.studyStreaks.current}/30</span>
                </div>
                <Progress 
                  value={Math.min((learningPattern.studyStreaks.current / 30) * 100, 100)} 
                  className="h-2" 
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  </div>
  );
}