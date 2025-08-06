
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Language } from "./LanguageToggle";
import { usePersonalizationEngine } from "@/hooks/usePersonalizationEngine";
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  Target,
  Award,
  Clock
} from "lucide-react";

interface LearningStreaksProps {
  language: Language;
}

const content = {
  en: {
    title: "Learning Progress",
    currentStreak: "Current Streak",
    longestStreak: "Longest Streak",
    days: "days",
    day: "day",
    totalSessions: "Total Sessions",
    totalReflections: "Reflections Written",
    averageTime: "Average Session",
    minutes: "minutes",
    consistencyScore: "Consistency Score",
    weeklyGrowth: "Weekly Growth",
    monthlyGrowth: "Monthly Growth",
    favoriteTopics: "Favorite Topics",
    achievements: "Achievements",
    keepGoing: "Keep going!",
    greatProgress: "Great progress!",
    onFire: "You're on fire!",
    firstStep: "First step taken",
    consistent: "Consistent learner",
    dedicated: "Dedicated student",
    scholar: "Torah scholar",
    studiedToday: "Studied today",
    studiedYesterday: "Last study session was yesterday",
    studiedRecently: "Last study session was recent",
    comeBack: "Come back tomorrow to continue your streak!"
  },
  he: {
    title: "התקדמות בלמידה",
    currentStreak: "רצף נוכחי",
    longestStreak: "הרצף הארוך ביותר",
    days: "ימים",
    day: "יום",
    totalSessions: "סה״כ שיעורים",
    totalReflections: "הרהורים שנכתבו",
    averageTime: "זמן ממוצע לשיעור",
    minutes: "דקות",
    consistencyScore: "ציון עקביות",
    weeklyGrowth: "צמיחה שבועית",
    monthlyGrowth: "צמיחה חודשית",
    favoriteTopics: "נושאים מועדפים",
    achievements: "הישגים",
    keepGoing: "המשך כך!",
    greatProgress: "התקדמות מעולה!",
    onFire: "אתה בוער!",
    firstStep: "הצעד הראשון נעשה",
    consistent: "לומד עקבי",
    dedicated: "תלמיד מסור",
    scholar: "תלמיד חכם",
    studiedToday: "למד היום",
    studiedYesterday: "השיעור האחרון היה אתמול",
    studiedRecently: "השיעור האחרון היה לאחרונה",
    comeBack: "חזור מחר כדי להמשיך את הרצף!"
  }
};

export const LearningStreaks = ({ language }: LearningStreaksProps) => {
  const { learningPattern, analytics } = usePersonalizationEngine();
  const t = content[language];

  const getStreakMessage = () => {
    const { current } = learningPattern.studyStreaks;
    if (current === 0) return t.comeBack;
    if (current === 1) return t.studiedToday;
    if (current < 7) return t.keepGoing;
    if (current < 30) return t.greatProgress;
    return t.onFire;
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (analytics.totalSessions >= 1) {
      achievements.push({ name: t.firstStep, icon: "🎯" });
    }
    if (learningPattern.studyStreaks.current >= 3) {
      achievements.push({ name: t.consistent, icon: "📚" });
    }
    if (learningPattern.studyStreaks.current >= 7) {
      achievements.push({ name: t.dedicated, icon: "⭐" });
    }
    if (analytics.totalSessions >= 50) {
      achievements.push({ name: t.scholar, icon: "🎓" });
    }
    
    return achievements;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const achievements = getAchievements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
        <p className="text-muted-foreground">{getStreakMessage()}</p>
      </div>

      {/* Streak Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold">{t.currentStreak}</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-500">
              {learningPattern.studyStreaks.current}
            </div>
            <div className="text-sm text-muted-foreground">
              {learningPattern.studyStreaks.current === 1 ? t.day : t.days}
            </div>
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">{t.longestStreak}</h3>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-yellow-500">
              {learningPattern.studyStreaks.longest}
            </div>
            <div className="text-sm text-muted-foreground">
              {learningPattern.studyStreaks.longest === 1 ? t.day : t.days}
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <Calendar className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{analytics.totalSessions}</div>
          <div className="text-xs text-muted-foreground">{t.totalSessions}</div>
        </Card>

        <Card className="p-4 text-center">
          <Target className="h-5 w-5 text-green-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{analytics.totalReflections}</div>
          <div className="text-xs text-muted-foreground">{t.totalReflections}</div>
        </Card>

        <Card className="p-4 text-center">
          <Clock className="h-5 w-5 text-purple-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{Math.round(analytics.averageSessionTime)}</div>
          <div className="text-xs text-muted-foreground">{t.minutes}</div>
        </Card>

        <Card className="p-4 text-center">
          <TrendingUp className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
          <div className="text-xl font-bold">{Math.round(analytics.learningTrends.consistencyScore)}%</div>
          <div className="text-xs text-muted-foreground">{t.consistencyScore}</div>
        </Card>
      </div>

      {/* Growth Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Learning Trends
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t.weeklyGrowth}</span>
              <span className={analytics.learningTrends.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatGrowth(analytics.learningTrends.weeklyGrowth)}
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, 50 + analytics.learningTrends.weeklyGrowth))} 
              className="h-2"
            />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t.monthlyGrowth}</span>
              <span className={analytics.learningTrends.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatGrowth(analytics.learningTrends.monthlyGrowth)}
              </span>
            </div>
            <Progress 
              value={Math.max(0, Math.min(100, 50 + analytics.learningTrends.monthlyGrowth))} 
              className="h-2"
            />
          </div>
        </div>
      </Card>

      {/* Favorite Topics */}
      {analytics.favoriteCategories.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{t.favoriteTopics}</h3>
          <div className="flex flex-wrap gap-2">
            {analytics.favoriteCategories.map((topic, index) => (
              <Badge 
                key={topic} 
                variant={index === 0 ? "default" : "secondary"}
                className="capitalize"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            {t.achievements}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-sm font-medium">{achievement.name}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};