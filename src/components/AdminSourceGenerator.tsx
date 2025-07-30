import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAISourceGenerator } from '@/hooks/useAISourceGenerator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export const AdminSourceGenerator = () => {
  const [topic, setTopic] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState('beginner');
  const [count, setCount] = useState(1);
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  
  const { bulkGenerateSource, isGenerating } = useAISourceGenerator();

  const topics = [
    'Shabbat', 'Kashrut', 'Prayer', 'Torah Study', 'Ethics', 'Family', 
    'Business', 'Holidays', 'Lifecycle', 'Tikkun Olam', 'Spirituality',
    'Relationships', 'Community', 'Leadership', 'Wisdom', 'Faith'
  ];

  const handleBulkGenerate = async () => {
    if (!topic || timeMinutes < 5) return;
    
    setProgress(0);
    setGeneratedCount(0);
    setErrors([]);
    
    try {
      const batchSize = 3; // Generate in smaller batches to avoid timeouts
      const batches = Math.ceil(count / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const currentBatchSize = Math.min(batchSize, count - (i * batchSize));
        
        const sources = await bulkGenerateSource({
          topic,
          timeMinutes,
          difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced',
          count: currentBatchSize,
          saveToDatabase: true
        });
        
        setGeneratedCount(prev => prev + sources.length);
        setProgress(((i + 1) / batches) * 100);
        
        if (sources.length < currentBatchSize) {
          setErrors(prev => [...prev, `Batch ${i + 1}: Only generated ${sources.length}/${currentBatchSize} sources`]);
        }
      }
    } catch (error) {
      setErrors(prev => [...prev, `Generation failed: ${error}`]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AI Source Generator</h1>
        <p className="text-muted-foreground">Generate Torah learning sources using AI</p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time (minutes)</Label>
            <Input
              id="time"
              type="number"
              min={5}
              max={60}
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(parseInt(e.target.value) || 15)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Sources</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <Button 
          onClick={handleBulkGenerate}
          disabled={isGenerating || !topic || timeMinutes < 5}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating... ({generatedCount}/{count})
            </>
          ) : (
            `Generate ${count} Source${count !== 1 ? 's' : ''}`
          )}
        </Button>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="text-center text-sm text-muted-foreground">
              Generated {generatedCount} of {count} sources
            </div>
          </div>
        )}

        {generatedCount > 0 && !isGenerating && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Successfully generated {generatedCount} sources</span>
          </div>
        )}

        {errors.length > 0 && (
          <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Generation Errors
                </h4>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-0.5">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Generation Parameters</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Topic: {topic || 'Not selected'}</Badge>
          <Badge variant="outline">Time: {timeMinutes} minutes</Badge>
          <Badge variant="outline">Difficulty: {difficulty}</Badge>
          <Badge variant="outline">Count: {count}</Badge>
        </div>
      </Card>
    </div>
  );
};