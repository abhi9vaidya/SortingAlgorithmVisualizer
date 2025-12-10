import { LoopState } from '@/core/types';
import { cn } from '@/lib/utils';

interface LoopVisualizerProps {
  loops: LoopState[];
}

const COLORS = [
  'bg-primary',
  'bg-accent', 
  'bg-warning',
  'bg-success',
  'bg-destructive',
];

const LoopVisualizer = ({ loops }: LoopVisualizerProps) => {
  if (loops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">No loops yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Loops will be visualized here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loops.map((loop, loopIndex) => {
        const colorClass = COLORS[loopIndex % COLORS.length];
        const progress = loop.max > 0 ? Math.min((loop.current / loop.max) * 100, 100) : 0;
        
        return (
          <div
            key={loop.id}
            className={cn(
              "soft-panel p-4 transition-all duration-300",
              loop.isActive && "ring-2 ring-primary/30"
            )}
          >
            {/* Loop Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  colorClass,
                  loop.isActive && "animate-pulse-soft"
                )} />
                <span className="text-sm font-medium text-foreground">
                  Loop: {loop.variable}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {loop.current} / {loop.max}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className={cn("h-full rounded-full transition-all duration-500 ease-out", colorClass)}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Iteration Dots */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: Math.min(loop.max, 10) }, (_, i) => {
                const iterationValue = i + 1;
                const isCompleted = loop.iterations.includes(iterationValue) || iterationValue < loop.current;
                const isCurrent = iterationValue === loop.current;
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "iteration-dot border-2 transition-all duration-300",
                      isCompleted || isCurrent
                        ? cn(colorClass, "text-primary-foreground border-transparent")
                        : "bg-muted border-border text-muted-foreground",
                      isCurrent && "active scale-110"
                    )}
                    style={{
                      animationDelay: `${i * 50}ms`
                    }}
                  >
                    {iterationValue}
                  </div>
                );
              })}
              {loop.max > 10 && (
                <div className="iteration-dot bg-muted text-muted-foreground border-2 border-dashed border-border">
                  +{loop.max - 10}
                </div>
              )}
            </div>

            {/* Iteration History */}
            {loop.iterations.length > 1 && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Iteration history:</p>
                <div className="flex gap-1 flex-wrap">
                  {loop.iterations.slice(-8).map((val, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full animate-pop-in",
                        i === loop.iterations.slice(-8).length - 1
                          ? cn(colorClass, "text-primary-foreground")
                          : "bg-secondary text-secondary-foreground"
                      )}
                      style={{ animationDelay: `${i * 30}ms` }}
                    >
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LoopVisualizer;
