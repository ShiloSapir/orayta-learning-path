import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppToast } from '@/hooks/useToast';
import { 
  Bell, 
  BookmarkPlus, 
  Share2, 
  Download, 
  Calendar,
  Heart,
  MessageSquare,
  Wifi,
  WifiOff,
  Bookmark,
  Clock,
  Target,
  Zap,
  Settings
} from 'lucide-react';
import { Language } from './LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedUserExperienceFeaturesProps {
  language: Language;
}

interface Reminder {
  id: string;
  title: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'custom';
  active: boolean;
}

interface BookmarkedSource {
  id: string;
  title: string;
  category: string;
  dateBookmarked: string;
  tags: string[];
}

interface OfflineContent {
  id: string;
  title: string;
  content: string;
  downloadedAt: string;
  size: number;
}

const content = {
  en: {
    title: 'Learning Features',
    reminders: 'Learning Reminders',
    bookmarks: 'Saved Sources',
    sharing: 'Share Progress',
    offline: 'Offline Learning',
    notifications: 'Notifications',
    preferences: 'Preferences',
    
    // Reminders
    createReminder: 'Create Reminder',
    reminderTime: 'Reminder Time',
    reminderFrequency: 'Frequency',
    dailyReminder: 'Daily Reminder',
    weeklyReminder: 'Weekly Reminder',
    customReminder: 'Custom',
    activeReminders: 'Active Reminders',
    noReminders: 'No reminders set',
    
    // Bookmarks
    addBookmark: 'Add Bookmark',
    bookmarkSource: 'Bookmark this source',
    savedSources: 'Saved Sources',
    noBookmarks: 'No bookmarked sources',
    addTags: 'Add tags',
    filterByTag: 'Filter by tag',
    
    // Sharing
    shareProgress: 'Share Your Progress',
    shareStreak: 'Share Learning Streak',
    shareReflection: 'Share Reflection',
    shareSource: 'Share Source',
    socialPlatforms: 'Social Platforms',
    copiedToClipboard: 'Copied to clipboard!',
    
    // Offline
    offlineMode: 'Offline Mode',
    downloadForOffline: 'Download for Offline',
    offlineContent: 'Downloaded Content',
    storageUsed: 'Storage Used',
    clearOfflineData: 'Clear Offline Data',
    offlineAvailable: 'Available Offline',
    syncWhenOnline: 'Sync when online',
    
    // Notifications
    enableNotifications: 'Enable Notifications',
    learningReminders: 'Learning Reminders',
    streakAlerts: 'Streak Alerts',
    newContent: 'New Content Available',
    weeklyDigest: 'Weekly Progress Digest',
    
    // Preferences
    autoBookmark: 'Auto-bookmark completed sources',
    syncCalendar: 'Sync with calendar',
    smartSuggestions: 'Smart content suggestions',
    offlineSync: 'Auto-sync offline content',
    achievementCelebrations: 'Achievement celebrations'
  },
  he: {
    title: 'תכונות למידה',
    reminders: 'תזכורות למידה',
    bookmarks: 'מקורות שמורים',
    sharing: 'שיתוף התקדמות',
    offline: 'למידה לא מקוונת',
    notifications: 'התראות',
    preferences: 'העדפות',
    
    // Reminders
    createReminder: 'צור תזכורת',
    reminderTime: 'זמן תזכורת',
    reminderFrequency: 'תדירות',
    dailyReminder: 'תזכורת יומית',
    weeklyReminder: 'תזכורת שבועית',
    customReminder: 'מותאם אישית',
    activeReminders: 'תזכורות פעילות',
    noReminders: 'לא הוגדרו תזכורות',
    
    // Bookmarks
    addBookmark: 'הוסף לשמורים',
    bookmarkSource: 'שמור מקור זה',
    savedSources: 'מקורות שמורים',
    noBookmarks: 'אין מקורות שמורים',
    addTags: 'הוסף תגיות',
    filterByTag: 'סנן לפי תגית',
    
    // Sharing
    shareProgress: 'שתף את ההתקדמות שלך',
    shareStreak: 'שתף רצף למידה',
    shareReflection: 'שתף הרהור',
    shareSource: 'שתף מקור',
    socialPlatforms: 'רשתות חברתיות',
    copiedToClipboard: 'הועתק ללוח!',
    
    // Offline
    offlineMode: 'מצב לא מקוון',
    downloadForOffline: 'הורד לשימוש לא מקוון',
    offlineContent: 'תוכן שהורד',
    storageUsed: 'שטח אחסון בשימוש',
    clearOfflineData: 'נקה נתונים לא מקוונים',
    offlineAvailable: 'זמין לא מקוון',
    syncWhenOnline: 'סנכרן כשמקוון',
    
    // Notifications
    enableNotifications: 'הפעל התראות',
    learningReminders: 'תזכורות למידה',
    streakAlerts: 'התראות רצף',
    newContent: 'תוכן חדש זמין',
    weeklyDigest: 'סיכום שבועי',
    
    // Preferences
    autoBookmark: 'שמור אוטומטית מקורות שהושלמו',
    syncCalendar: 'סנכרן עם לוח שנה',
    smartSuggestions: 'הצעות תוכן חכמות',
    offlineSync: 'סנכרון אוטומטי לא מקוון',
    achievementCelebrations: 'חגיגות הישגים'
  }
};

export function EnhancedUserExperienceFeatures({ language }: EnhancedUserExperienceFeaturesProps) {
  const { user } = useAuth();
  const { success, error } = useAppToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedSource[]>([]);
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [preferences, setPreferences] = useState({
    notifications: true,
    autoBookmark: false,
    syncCalendar: false,
    smartSuggestions: true,
    offlineSync: true,
    achievementCelebrations: true
  });
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    available: 0
  });

  const t = content[language];
  const isHebrew = language === 'he';

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadUserData();
    calculateStorageUsage();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    // Load saved preferences
    const savedPrefs = localStorage.getItem(`user_preferences_${user.id}`);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }

    // Load bookmarks
    const savedBookmarks = localStorage.getItem(`user_bookmarks_${user.id}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    // Load reminders
    const savedReminders = localStorage.getItem(`user_reminders_${user.id}`);
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }

    // Load offline content
    const savedOffline = localStorage.getItem(`offline_content_${user.id}`);
    if (savedOffline) {
      setOfflineContent(JSON.parse(savedOffline));
    }
  };

  const savePreferences = (newPrefs: typeof preferences) => {
    setPreferences(newPrefs);
    if (user) {
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(newPrefs));
    }
  };

  const calculateStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageInfo({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        });
      } catch (err) {
        console.error('Storage estimate failed:', err);
      }
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: 'Daily Learning Session',
      time: '09:00',
      frequency: 'daily',
      active: true
    };
    
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    
    if (user) {
      localStorage.setItem(`user_reminders_${user.id}`, JSON.stringify(updatedReminders));
    }
    
    success('Reminder created successfully');
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, active: !reminder.active } : reminder
    );
    setReminders(updated);
    
    if (user) {
      localStorage.setItem(`user_reminders_${user.id}`, JSON.stringify(updated));
    }
  };

  const addBookmark = (source: any) => {
    const newBookmark: BookmarkedSource = {
      id: source.id,
      title: source.title,
      category: source.category,
      dateBookmarked: new Date().toISOString(),
      tags: []
    };
    
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    
    if (user) {
      localStorage.setItem(`user_bookmarks_${user.id}`, JSON.stringify(updated));
    }
    
    success(t.copiedToClipboard);
  };

  const shareProgress = async (type: 'streak' | 'reflection' | 'progress') => {
    const shareData = {
      title: 'My Torah Learning Journey',
      text: 'Check out my progress in Torah learning!',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        success(t.copiedToClipboard);
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
      success(t.copiedToClipboard);
    }
  };

  const downloadForOffline = async (sourceId: string) => {
    try {
      // Simulate downloading source content
      const mockContent: OfflineContent = {
        id: sourceId,
        title: 'Downloaded Source',
        content: 'Source content for offline access...',
        downloadedAt: new Date().toISOString(),
        size: 1024 * 50 // 50KB
      };
      
      const updated = [...offlineContent, mockContent];
      setOfflineContent(updated);
      
      if (user) {
        localStorage.setItem(`offline_content_${user.id}`, JSON.stringify(updated));
      }
      
      success('Content downloaded for offline access');
      calculateStorageUsage();
    } catch (err) {
      error('Failed to download content');
    }
  };

  const clearOfflineData = () => {
    setOfflineContent([]);
    if (user) {
      localStorage.removeItem(`offline_content_${user.id}`);
    }
    calculateStorageUsage();
    success('Offline data cleared');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        savePreferences({ ...preferences, notifications: true });
        success('Notifications enabled');
      } else {
        error('Notification permission denied');
      }
    }
  };

  return (
    <div className={`space-y-6 ${isHebrew ? 'text-right' : 'text-left'}`}>
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-1 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">Offline Mode</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="reminders" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="reminders">
            <Bell className="h-4 w-4 mr-1" />
            {t.reminders.split(' ')[0]}
          </TabsTrigger>
          <TabsTrigger value="bookmarks">
            <Bookmark className="h-4 w-4 mr-1" />
            {t.bookmarks.split(' ')[0]}
          </TabsTrigger>
          <TabsTrigger value="sharing">
            <Share2 className="h-4 w-4 mr-1" />
            {t.sharing.split(' ')[0]}
          </TabsTrigger>
          <TabsTrigger value="offline">
            <Download className="h-4 w-4 mr-1" />
            {t.offline.split(' ')[0]}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-1" />
            {t.preferences}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reminders" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t.reminders}</h2>
              <Button onClick={createReminder}>
                <Bell className="h-4 w-4 mr-2" />
                {t.createReminder}
              </Button>
            </div>
            
            {reminders.length > 0 ? (
              <div className="space-y-3">
                {reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{reminder.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{reminder.time}</span>
                        <Badge variant="outline" className="text-xs">
                          {reminder.frequency}
                        </Badge>
                      </div>
                    </div>
                    <Switch 
                      checked={reminder.active}
                      onCheckedChange={() => toggleReminder(reminder.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noReminders}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t.savedSources}</h2>
              <Button onClick={() => addBookmark({ id: 'demo', title: 'Demo Source', category: 'halacha' })}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {t.addBookmark}
              </Button>
            </div>
            
            {bookmarks.length > 0 ? (
              <div className="space-y-3">
                {bookmarks.map(bookmark => (
                  <div key={bookmark.id} className="p-3 border rounded-lg">
                    <h3 className="font-semibold">{bookmark.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{bookmark.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Saved {new Date(bookmark.dateBookmarked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{t.noBookmarks}</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.shareProgress}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => shareProgress('streak')}
              >
                <Target className="h-6 w-6 mb-2" />
                {t.shareStreak}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => shareProgress('reflection')}
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                {t.shareReflection}
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => shareProgress('progress')}
              >
                <Heart className="h-6 w-6 mb-2" />
                {t.shareProgress.split(' ')[1]}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{t.offlineMode}</h2>
              <div className="text-sm text-muted-foreground">
                {t.storageUsed}: {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>{t.downloadForOffline}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadForOffline('demo-source')}
                  disabled={!isOnline}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              {offlineContent.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{t.offlineContent}</h3>
                    <Button variant="destructive" size="sm" onClick={clearOfflineData}>
                      {t.clearOfflineData}
                    </Button>
                  </div>
                  {offlineContent.map(content => (
                    <div key={content.id} className="p-2 border rounded text-sm">
                      <div className="flex items-center justify-between">
                        <span>{content.title}</span>
                        <span className="text-muted-foreground">{formatBytes(content.size)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">{t.preferences}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.enableNotifications}</h3>
                  <p className="text-sm text-muted-foreground">{t.learningReminders}</p>
                </div>
                <Switch 
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      requestNotificationPermission();
                    } else {
                      savePreferences({ ...preferences, notifications: false });
                    }
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.autoBookmark}</h3>
                  <p className="text-sm text-muted-foreground">Auto-save completed sources</p>
                </div>
                <Switch 
                  checked={preferences.autoBookmark}
                  onCheckedChange={(checked) => savePreferences({ ...preferences, autoBookmark: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.smartSuggestions}</h3>
                  <p className="text-sm text-muted-foreground">Get personalized content recommendations</p>
                </div>
                <Switch 
                  checked={preferences.smartSuggestions}
                  onCheckedChange={(checked) => savePreferences({ ...preferences, smartSuggestions: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.offlineSync}</h3>
                  <p className="text-sm text-muted-foreground">Automatically sync when online</p>
                </div>
                <Switch 
                  checked={preferences.offlineSync}
                  onCheckedChange={(checked) => savePreferences({ ...preferences, offlineSync: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{t.achievementCelebrations}</h3>
                  <p className="text-sm text-muted-foreground">Celebrate learning milestones</p>
                </div>
                <Switch 
                  checked={preferences.achievementCelebrations}
                  onCheckedChange={(checked) => savePreferences({ ...preferences, achievementCelebrations: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}