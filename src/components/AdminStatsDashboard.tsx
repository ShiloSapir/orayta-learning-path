import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarDays, Download, TrendingUp, Users, MousePointer, AlertTriangle, Clock, BarChart3 } from 'lucide-react';

interface KPIs {
  dau: number;
  wau: number;
  mau: number;
  topic_mix: Record<string, number>;
  time_bucket_usage: Record<string, number>;
  ctr: number;
  completion_rate: number;
  error_rate: number;
}

interface TimeSeries {
  daily_recommendations: Record<string, number>;
  daily_clicks: Record<string, number>;
  daily_errors: Record<string, number>;
  latency_series: Array<{ date: string; latency: number }>;
}

interface StatsData {
  kpis: KPIs;
  series: TimeSeries;
  filters: any;
}

interface StatsFilters {
  from: string;
  to: string;
  topic?: string;
  time_bucket?: string;
  locale?: string;
  platform?: string;
}

const TOPICS = ['Halacha', 'Mussar', 'Parasha', 'Gemara'];
const TIME_BUCKETS = ['5', '15', '30', '60'];


export const AdminStatsDashboard = () => {
  const { toast } = useToast();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<StatsFilters>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data: statsData, error } = await supabase.functions.invoke('admin-stats', {
        method: 'GET'
      });

      if (error) throw error;
      setData(statsData);

    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      toast({
        title: "Failed to load stats",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('export', 'true');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `orayta-stats-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Stats exported to CSV file"
      });

    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getTopTopics = () => {
    if (!data?.kpis.topic_mix) return [];
    return Object.entries(data.kpis.topic_mix)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopTimeBuckets = () => {
    if (!data?.kpis.time_bucket_usage) return [];
    return Object.entries(data.kpis.time_bucket_usage)
      .sort(([,a], [,b]) => b - a);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            View application usage statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select
                value={filters.topic ?? 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, topic: value === 'all' ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All topics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All topics</SelectItem>
                  {TOPICS.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_bucket">Time Bucket</Label>
              <Select
                value={filters.time_bucket ?? 'all'}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    time_bucket: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All durations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All durations</SelectItem>
                  {TIME_BUCKETS.map((bucket) => (
                    <SelectItem key={bucket} value={bucket}>
                      {bucket} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchStats} disabled={loading}>
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Refresh Stats
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(data.kpis.dau)}</div>
                <p className="text-xs text-muted-foreground">
                  WAU: {formatNumber(data.kpis.wau)} | MAU: {formatNumber(data.kpis.mau)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.kpis.ctr)}</div>
                <p className="text-xs text-muted-foreground">
                  Recommendation → Sefaria clicks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.kpis.completion_rate)}</div>
                <p className="text-xs text-muted-foreground">
                  Sessions completed successfully
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(data.kpis.error_rate)}</div>
                <p className="text-xs text-muted-foreground">
                  System error percentage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Topic Mix and Time Bucket Usage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Most popular learning topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopTopics().map(([topic, percentage]) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{topic}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <Badge variant="outline">{formatPercentage(percentage)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time Bucket Usage</CardTitle>
                <CardDescription>Preferred study durations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getTopTimeBuckets().map(([bucket, percentage]) => (
                    <div key={bucket} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{bucket} minutes</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <Badge variant="outline">{formatPercentage(percentage)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Series Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Recommendations and clicks over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.series.daily_recommendations).slice(-7).map(([date, count]) => {
                    const clicks = data.series.daily_clicks[date] || 0;
                    const ctr = count > 0 ? (clicks / count) * 100 : 0;
                    
                    return (
                      <div key={date} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="space-y-1">
                          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(count)} recommendations, {formatNumber(clicks)} clicks
                          </div>
                        </div>
                        <Badge variant="outline">
                          {formatPercentage(ctr)} CTR
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Tracking</CardTitle>
                <CardDescription>Daily error rates and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(data.series.daily_errors).slice(-7).map(([date, errors]) => {
                    const latencyData = data.series.latency_series.filter(l => l.date === date);
                    const avgLatency = latencyData.length > 0 
                      ? latencyData.reduce((sum, l) => sum + l.latency, 0) / latencyData.length 
                      : 0;
                    
                    return (
                      <div key={date} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="space-y-1">
                          <div className="font-medium">{new Date(date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatNumber(errors)} errors
                            {avgLatency > 0 && ` | ${Math.round(avgLatency)}ms avg latency`}
                          </div>
                        </div>
                        <Badge variant={errors > 0 ? "destructive" : "default"}>
                          {errors > 0 ? 'Issues' : 'Healthy'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {!data && !loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Refresh Stats" to load analytics data</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};