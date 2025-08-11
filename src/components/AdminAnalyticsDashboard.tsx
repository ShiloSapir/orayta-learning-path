import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Download, Play, AlertTriangle, Users, Clock, Smartphone, Monitor, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  newSignUps: { daily: number; total: number };
  sessionCounts: { started: number; completed: number };
  topicBreakdown: Array<{ topic: string; count: number; percentage: number }>;
  timeBucketUsage: Array<{ duration: number; count: number; percentage: number }>;
  ctirToSefaria: number;
  retentionRates: { day1: number; day7: number; day30: number };
  topRecommendedSources: Array<{ title: string; count: number; link: string }>;
  completionRates: number;
  avgResponseTime: number;
  errorRate: number;
  latencyStats: { p50: number; p95: number };
  deviceSplit: { ios: number; android: number; web: number };
}

const EMPTY_ANALYTICS: AnalyticsData = {
  dailyActiveUsers: 0,
  weeklyActiveUsers: 0,
  monthlyActiveUsers: 0,
  newSignUps: { daily: 0, total: 0 },
  sessionCounts: { started: 0, completed: 0 },
  topicBreakdown: [],
  timeBucketUsage: [],
  ctirToSefaria: 0,
  retentionRates: { day1: 0, day7: 0, day30: 0 },
  topRecommendedSources: [],
  completionRates: 0,
  avgResponseTime: 0,
  errorRate: 0,
  latencyStats: { p50: 0, p95: 0 },
  deviceSplit: { ios: 0, android: 0, web: 0 },
};

interface TestResult {
  passed: boolean;
  responseTime: number;
  content: string;
  logs: string[];
  error?: string;
}

export const AdminAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("7d");
  const [testTopic, setTestTopic] = useState("Talmud");
  const [testTime, setTestTime] = useState("15");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        body: { 
          dateRange,
          startDate: getStartDate(dateRange),
          endDate: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;
      const mergedAnalytics: AnalyticsData = {
        ...EMPTY_ANALYTICS,
        ...(data || {}),
        newSignUps: { ...EMPTY_ANALYTICS.newSignUps, ...(data?.newSignUps || {}) },
        sessionCounts: { ...EMPTY_ANALYTICS.sessionCounts, ...(data?.sessionCounts || {}) },
        topicBreakdown: data?.topicBreakdown ?? EMPTY_ANALYTICS.topicBreakdown,
        timeBucketUsage: data?.timeBucketUsage ?? EMPTY_ANALYTICS.timeBucketUsage,
        retentionRates: { ...EMPTY_ANALYTICS.retentionRates, ...(data?.retentionRates || {}) },
        topRecommendedSources: data?.topRecommendedSources ?? EMPTY_ANALYTICS.topRecommendedSources,
        latencyStats: { ...EMPTY_ANALYTICS.latencyStats, ...(data?.latencyStats || {}) },
        deviceSplit: { ...EMPTY_ANALYTICS.deviceSplit, ...(data?.deviceSplit || {}) },
      };
      setAnalytics(mergedAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
      // Set mock data for demo
      setAnalytics(getMockAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  };

  const getMockAnalytics = (): AnalyticsData => ({
    dailyActiveUsers: 47,
    weeklyActiveUsers: 183,
    monthlyActiveUsers: 521,
    newSignUps: { daily: 8, total: 1247 },
    sessionCounts: { started: 156, completed: 142 },
    topicBreakdown: [
      { topic: "Talmud", count: 45, percentage: 28.8 },
      { topic: "Tanakh", count: 38, percentage: 24.4 },
      { topic: "Halacha", count: 32, percentage: 20.5 },
      { topic: "Machshava", count: 25, percentage: 16.0 },
      { topic: "Other", count: 16, percentage: 10.3 }
    ],
    timeBucketUsage: [
      { duration: 15, count: 67, percentage: 43.0 },
      { duration: 30, count: 42, percentage: 26.9 },
      { duration: 5, count: 28, percentage: 17.9 },
      { duration: 60, count: 19, percentage: 12.2 }
    ],
    ctirToSefaria: 73.5,
    retentionRates: { day1: 85.2, day7: 42.1, day30: 18.7 },
    topRecommendedSources: [
      { title: "Berachot 2a", count: 23, link: "https://sefaria.org/Berakhot.2a" },
      { title: "Genesis 1:1", count: 19, link: "https://sefaria.org/Genesis.1.1" },
      { title: "Shabbat 31a", count: 16, link: "https://sefaria.org/Shabbat.31a" }
    ],
    completionRates: 68.4,
    avgResponseTime: 1247,
    errorRate: 2.1,
    latencyStats: { p50: 890, p95: 2340 },
    deviceSplit: { ios: 32, android: 28, web: 40 }
  });

  const runManualTest = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-runner', {
        body: {
          suite: 'recommendation',
          case: 'manual',
          topic: testTopic,
          timeSelected: parseInt(testTime),
          language: 'en'
        }
      });

      if (error) throw error;
      setTestResult(data);
      toast({
        title: "Test Complete",
        description: data.passed ? "Test passed successfully" : "Test failed",
        variant: data.passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Error",
        description: "Failed to run manual test",
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-stats', {
        body: { 
          export: true,
          format,
          dateRange,
          startDate: getStartDate(dateRange),
          endDate: new Date().toISOString().split('T')[0]
        }
      });

      if (error) throw error;
      
      const blob = new Blob([data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${dateRange}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: `Analytics data exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <Label htmlFor="dateRange">Date Range:</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">User Metrics</TabsTrigger>
          <TabsTrigger value="content">Content Data</TabsTrigger>
          <TabsTrigger value="technical">Technical Health</TabsTrigger>
          <TabsTrigger value="testing">Testing Tools</TabsTrigger>
        </TabsList>

        {/* User & Engagement Metrics */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Daily Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.dailyActiveUsers}</div>
                <Badge variant="secondary">DAU</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.weeklyActiveUsers}</div>
                <Badge variant="secondary">WAU</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.monthlyActiveUsers}</div>
                <Badge variant="secondary">MAU</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">New Sign-Ups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.newSignUps.daily}</div>
                <div className="text-sm text-muted-foreground">Total: {analytics.newSignUps.total}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Started</span>
                    <span className="font-semibold">{analytics.sessionCounts.started}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-semibold">{analytics.sessionCounts.completed}</span>
                  </div>
                  <Progress 
                    value={(analytics.sessionCounts.completed / analytics.sessionCounts.started) * 100} 
                    className="h-2" 
                  />
                  <div className="text-sm text-muted-foreground">
                    {((analytics.sessionCounts.completed / analytics.sessionCounts.started) * 100).toFixed(1)}% completion rate
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CTR to Sefaria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics.ctirToSefaria}%</div>
                <Progress value={analytics.ctirToSefaria} className="h-2 mt-4" />
                <div className="text-sm text-muted-foreground mt-2">
                  Recommendations that lead to clicks
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Topic Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topicBreakdown.map((topic) => (
                    <div key={topic.topic} className="flex items-center justify-between">
                      <span className="text-sm">{topic.topic}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={topic.percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12">{topic.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Bucket Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.timeBucketUsage.map((bucket) => (
                    <div key={bucket.duration} className="flex items-center justify-between">
                      <span className="text-sm">{bucket.duration} min</span>
                      <div className="flex items-center gap-2">
                        <Progress value={bucket.percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium w-12">{bucket.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Retention Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.retentionRates.day1}%</div>
                  <div className="text-sm text-muted-foreground">Day 1</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.retentionRates.day7}%</div>
                  <div className="text-sm text-muted-foreground">Day 7</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.retentionRates.day30}%</div>
                  <div className="text-sm text-muted-foreground">Day 30</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Data */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Recommended Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topRecommendedSources.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <a 
                          href={source.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline"
                        >
                          {source.title}
                        </a>
                        <div className="text-xs text-muted-foreground">{source.count} recommendations</div>
                      </div>
                      <Badge variant="outline">{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completion Rate</span>
                  <span className="font-semibold">{analytics.completionRates}%</span>
                </div>
                <Progress value={analytics.completionRates} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span>Avg Response Time</span>
                  <span className="font-semibold">{analytics.avgResponseTime}ms</span>
                </div>
                <Progress value={Math.min((2000 - analytics.avgResponseTime) / 2000 * 100, 100)} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Health */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.errorRate}%</div>
                <Badge variant={analytics.errorRate > 5 ? "destructive" : "secondary"}>
                  {analytics.errorRate > 5 ? "High" : "Normal"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  P50 Latency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.latencyStats.p50}ms</div>
                <Badge variant="secondary">Median</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">P95 Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.latencyStats.p95}ms</div>
                <Badge variant={analytics.latencyStats.p95 > 3000 ? "destructive" : "secondary"}>
                  {analytics.latencyStats.p95 > 3000 ? "Slow" : "Good"}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.avgResponseTime}ms</div>
                <Badge variant="secondary">Overall</Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device & Platform Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{analytics.deviceSplit.ios}%</div>
                  <div className="text-sm text-muted-foreground">iOS</div>
                </div>
                <div className="text-center">
                  <Smartphone className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{analytics.deviceSplit.android}%</div>
                  <div className="text-sm text-muted-foreground">Android</div>
                </div>
                <div className="text-center">
                  <Monitor className="h-8 w-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{analytics.deviceSplit.web}%</div>
                  <div className="text-sm text-muted-foreground">Web</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tools */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Recommendation Test</CardTitle>
              <CardDescription>Test the recommendation engine with custom parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testTopic">Topic</Label>
                  <Select value={testTopic} onValueChange={setTestTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Talmud">Talmud</SelectItem>
                      <SelectItem value="Tanakh">Tanakh</SelectItem>
                      <SelectItem value="Halacha">Halacha</SelectItem>
                      <SelectItem value="Machshava">Machshava</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testTime">Time (minutes)</Label>
                  <Select value={testTime} onValueChange={setTestTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={runManualTest} disabled={testLoading} className="w-full">
                {testLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Run Test
              </Button>

              {testResult && (
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={testResult.passed ? "default" : "destructive"}>
                      {testResult.passed ? "PASSED" : "FAILED"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {testResult.responseTime}ms
                    </span>
                  </div>
                  
                  {testResult.content && (
                    <div className="mb-2">
                      <Label className="text-sm font-medium">Generated Content:</Label>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded mt-1">
                        {testResult.content.slice(0, 200)}...
                      </p>
                    </div>
                  )}
                  
                  {testResult.logs.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Logs:</Label>
                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-32">
                        {testResult.logs.join('\n')}
                      </pre>
                    </div>
                  )}
                  
                  {testResult.error && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-red-600">Error:</Label>
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
                        {testResult.error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};