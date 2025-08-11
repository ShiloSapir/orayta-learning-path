import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, Copy, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

interface TestConfig {
  suite: string;
  case: string;
  topic?: string;
  time_bucket?: number;
  seed?: string;
  iterations?: number;
}

interface TestResult {
  passed: boolean;
  execution_time_ms: number;
  logs: string[];
  payload_snippet?: any;
  error_details?: string;
  metrics?: {
    latency_ms?: number;
    response_size?: number;
  };
}

interface TestRunResult {
  total_runs: number;
  passed_runs: number;
  avg_execution_time: number;
  results: TestResult | TestResult[];
}

const TEST_SUITES = [
  { value: 'recommendation', label: 'Recommendation Flow' },
  { value: 'content_rules', label: 'Content Rules' },
  { value: 'analytics', label: 'Session Analytics' }
];

const TEST_CASES = {
  recommendation: [
    { value: 'happy_path', label: 'Happy Path' },
    { value: 'performance', label: 'Performance Test' }
  ],
  content_rules: [
    { value: 'license_guard', label: 'License Guard' }
  ],
  analytics: [
    { value: 'event_logging', label: 'Event Logging' }
  ]
};

const TOPICS = [
  { value: 'Halacha', label: 'Halacha' },
  { value: 'Mussar', label: 'Mussar' },
  { value: 'Parasha', label: 'Parasha' },
  { value: 'Gemara', label: 'Gemara' }
];

const TIME_BUCKETS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' }
];

export const AdminTestRunner = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<TestConfig>({
    suite: '',
    case: '',
    iterations: 1
  });
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestRunResult | null>(null);

  const availableCases = config.suite ? TEST_CASES[config.suite as keyof typeof TEST_CASES] || [] : [];

  const runTest = async () => {
    if (!config.suite || !config.case) {
      toast({
        title: "Configuration Required",
        description: "Please select both a test suite and test case",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-test-runner', {
        body: config
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: "Test Completed",
        description: `${data.passed_runs}/${data.total_runs} tests passed`,
        variant: data.passed_runs === data.total_runs ? "default" : "destructive"
      });

    } catch (error: any) {
      console.error('Test run failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  const getResultIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Configuration
          </CardTitle>
          <CardDescription>
            Configure and run tests against core application flows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="suite">Test Suite</Label>
              <Select
                value={config.suite}
                onValueChange={(value) => setConfig({ ...config, suite: value, case: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select suite" />
                </SelectTrigger>
                <SelectContent>
                  {TEST_SUITES.map((suite) => (
                    <SelectItem key={suite.value} value={suite.value}>
                      {suite.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case">Test Case</Label>
              <Select
                value={config.case}
                onValueChange={(value) => setConfig({ ...config, case: value })}
                disabled={!config.suite}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select case" />
                </SelectTrigger>
                <SelectContent>
                  {availableCases.map((testCase) => (
                    <SelectItem key={testCase.value} value={testCase.value}>
                      {testCase.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {config.suite === 'recommendation' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Select
                  value={config.topic || ''}
                  onValueChange={(value) => setConfig({ ...config, topic: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((topic) => (
                      <SelectItem key={topic.value} value={topic.value}>
                        {topic.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_bucket">Time Bucket</Label>
                <Select
                  value={config.time_bucket?.toString() || ''}
                  onValueChange={(value) => setConfig({ ...config, time_bucket: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_BUCKETS.map((bucket) => (
                      <SelectItem key={bucket.value} value={bucket.value.toString()}>
                        {bucket.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (optional)</Label>
              <Input
                id="seed"
                placeholder="test-seed-123"
                value={config.seed || ''}
                onChange={(e) => setConfig({ ...config, seed: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iterations">Iterations</Label>
              <Input
                id="iterations"
                type="number"
                min="1"
                max="10"
                value={config.iterations || 1}
                onChange={(e) => setConfig({ ...config, iterations: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={runTest} 
              disabled={isRunning || !config.suite || !config.case}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setConfig({ ...config, iterations: 10 })}
              disabled={isRunning}
            >
              <Zap className="h-4 w-4 mr-2" />
              Run 10x
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Results
            {result && (
              <Badge variant={result.passed_runs === result.total_runs ? "default" : "destructive"}>
                {result.passed_runs}/{result.total_runs} passed
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Test execution results, logs, and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.passed_runs}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.total_runs - result.passed_runs}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{result.avg_execution_time}ms</div>
                  <div className="text-sm text-muted-foreground">Avg Time</div>
                </div>
              </div>

              {/* Single Result Display */}
              {!Array.isArray(result.results) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getResultIcon(result.results.passed)}
                    <span className="font-medium">
                      {result.results.passed ? 'PASSED' : 'FAILED'}
                    </span>
                    <Badge variant="outline">{result.results.execution_time_ms}ms</Badge>
                  </div>

                  {/* Metrics */}
                  {result.results.metrics && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded">
                      {result.results.metrics.latency_ms && (
                        <div>
                          <div className="text-sm text-muted-foreground">Latency</div>
                          <div className="font-medium">{result.results.metrics.latency_ms}ms</div>
                        </div>
                      )}
                      {result.results.metrics.response_size && (
                        <div>
                          <div className="text-sm text-muted-foreground">Response Size</div>
                          <div className="font-medium">{result.results.metrics.response_size} bytes</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Logs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Execution Logs</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(Array.isArray(result.results) ? 'Multiple results' : result.results.logs.join('\n'))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={Array.isArray(result.results) ? 'Multiple results - see individual runs below' : result.results.logs.join('\n')}
                      readOnly
                      className="h-32 font-mono text-sm"
                    />
                  </div>

                  {/* Payload Snippet */}
                  {!Array.isArray(result.results) && result.results.payload_snippet && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Payload Snippet</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(!Array.isArray(result.results) ? result.results.payload_snippet : {}, null, 2))}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        value={JSON.stringify(!Array.isArray(result.results) ? result.results.payload_snippet : {}, null, 2)}
                        readOnly
                        className="h-24 font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Error Details */}
                  {!Array.isArray(result.results) && result.results.error_details && (
                    <div className="space-y-2">
                      <Label className="text-red-600">Error Details</Label>
                      <Textarea
                        value={!Array.isArray(result.results) ? result.results.error_details || '' : ''}
                        readOnly
                        className="h-20 font-mono text-sm border-red-200"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Results Display */}
              {Array.isArray(result.results) && (
                <div className="space-y-2">
                  <Label>Multiple Run Results</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {result.results.map((res, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          {getResultIcon(res.passed)}
                          <span className="text-sm">Run {index + 1}</span>
                        </div>
                        <Badge variant="outline">{res.execution_time_ms}ms</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!result && !isRunning && (
            <div className="text-center text-muted-foreground py-8">
              Configure and run a test to see results here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};