import { Hash, Layers, Box, AlertCircle, Terminal } from 'lucide-react';
import { Variable, LoopState } from '@/core/types';
import { cn } from '@/lib/utils';
import LoopVisualizer from './LoopVisualizer';

interface StatePanelProps {
  currentLine: number;
  variables: Variable[];
  callStack: string[];
  output: string[];
  loops: LoopState[];
  error?: string;
}

const StatePanel = ({ currentLine, variables, callStack, output, loops, error }: StatePanelProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Layers className="w-4 h-4 text-accent" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">Execution State</span>
          <p className="text-xs text-muted-foreground">Variables & loops</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        {/* Current Line */}
        <div className="soft-panel p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current Line</span>
          </div>
          <div className="text-3xl font-display font-semibold text-primary">
            {currentLine > 0 ? currentLine : '—'}
          </div>
        </div>

        {/* Loop Visualizer */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Loop Progress</span>
          </div>
          <LoopVisualizer loops={loops} />
        </div>

        {/* Variables */}
        <div className="soft-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Box className="w-4 h-4 text-success" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Variables</span>
            {variables.length > 0 && (
              <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {variables.length}
              </span>
            )}
          </div>
          <div className="space-y-2">
            {variables.length > 0 ? (
              variables.map((variable, index) => (
                <div
                  key={variable.name}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300",
                    variable.changed 
                      ? "bg-primary/10 ring-1 ring-primary/20" 
                      : "bg-muted/50"
                  )}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <span className="text-sm font-medium text-foreground">{variable.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase bg-background px-1.5 py-0.5 rounded">
                      {variable.type}
                    </span>
                    <span className={cn(
                      "text-sm font-mono px-2 py-0.5 rounded-lg",
                      variable.changed 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground"
                    )}>
                      {formatValue(variable.value)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground italic py-4 text-center">
                No variables defined yet
              </div>
            )}
          </div>
        </div>

        {/* Console Output */}
        {output.length > 0 && (
          <div className="soft-panel p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Console</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
              {output.map((line, index) => (
                <div
                  key={index}
                  className="px-3 py-2 rounded-lg bg-muted/50 text-sm font-mono text-foreground animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="soft-panel p-4 border-destructive/30 bg-destructive/5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-xs font-medium text-destructive uppercase tracking-wide">Error</span>
            </div>
            <div className="text-sm font-mono text-destructive/90 break-words">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export default StatePanel;
