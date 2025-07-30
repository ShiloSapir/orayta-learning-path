import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SourceLoadingStateProps {
  message?: string;
  variant?: 'detailed' | 'minimal';
}

export const SourceLoadingState = ({ 
  message = "Finding your perfect source...", 
  variant = 'detailed' 
}: SourceLoadingStateProps) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl p-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="w-20" />
        </div>

        {/* Main content skeleton */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Text excerpt skeleton */}
            <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Category skeleton */}
            <div>
              <Skeleton className="h-5 w-20 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>

            {/* Reflection prompt skeleton */}
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          {/* Action buttons skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          {/* Primary actions skeleton */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>

        {/* Loading indicator with message */}
        <div className="text-center space-y-4 pt-4 border-t">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground animate-pulse">{message}</p>
          </div>
          
          {/* Loading tips */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>🔍 Analyzing your preferences...</p>
            <p>⏱️ Matching optimal study time...</p>
            <p>📚 Finding relevant sources...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};