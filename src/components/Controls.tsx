import { Play, Pause, SkipForward, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExecutionStatus } from '@/core/types';
import { cn } from '@/lib/utils';

interface ControlsProps {
  status: ExecutionStatus;
  onRun: () => void;
  onStep: () => void;
  onPause: () => void;
  onReset: () => void;
  isComplete: boolean;
  hasCode: boolean;
}

const Controls = ({ 
  status, 
  onRun, 
  onStep, 
  onPause, 
  onReset, 
  isComplete,
  hasCode 
}: ControlsProps) => {
  const isRunning = status === 'running';
  const isPaused = status === 'paused';
  const isIdle = status === 'idle';
  const isError = status === 'error';

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border bg-card/30">
      {/* Run / Pause Button */}
      {isRunning ? (
        <Button
          variant="secondary"
          size="default"
          onClick={onPause}
          className="gap-2 min-w-[110px]"
        >
          <Pause className="w-4 h-4" />
          Pause
        </Button>
      ) : (
        <Button
          variant="default"
          size="default"
          onClick={onRun}
          disabled={!hasCode || isComplete}
          className="gap-2 min-w-[110px] shadow-md"
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" />
              Resume
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run
            </>
          )}
        </Button>
      )}

      {/* Step Button */}
      <Button
        variant="outline"
        size="default"
        onClick={onStep}
        disabled={!hasCode || isComplete || isRunning}
        className="gap-2 min-w-[110px]"
      >
        <SkipForward className="w-4 h-4" />
        Step
      </Button>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="default"
        onClick={onReset}
        disabled={isIdle && !isComplete && !isError}
        className="gap-2 min-w-[110px]"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </Button>

      {/* Status Indicator */}
      <div className="ml-auto flex items-center gap-3">
        {isRunning && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Running</span>
          </div>
        )}
        {isPaused && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-warning">
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
            <span className="text-sm font-medium">Paused</span>
          </div>
        )}
        {isComplete && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-sm font-medium">Complete</span>
          </div>
        )}
        {isError && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-sm font-medium">Error</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
