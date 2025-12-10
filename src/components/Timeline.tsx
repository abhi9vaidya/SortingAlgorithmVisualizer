import { Clock, ArrowRight, CheckCircle, XCircle, RefreshCw, Terminal } from 'lucide-react';
import { HistoryEntry } from '@/core/types';
import { cn } from '@/lib/utils';

interface TimelineProps {
  history: HistoryEntry[];
  currentLine: number;
}

const getTypeIcon = (type?: HistoryEntry['type']) => {
  switch (type) {
    case 'loop':
      return <RefreshCw className="w-3 h-3" />;
    case 'condition':
      return <CheckCircle className="w-3 h-3" />;
    case 'output':
      return <Terminal className="w-3 h-3" />;
    default:
      return <ArrowRight className="w-3 h-3" />;
  }
};

const getTypeColor = (type?: HistoryEntry['type']) => {
  switch (type) {
    case 'loop':
      return 'bg-accent text-accent-foreground';
    case 'condition':
      return 'bg-warning text-warning-foreground';
    case 'output':
      return 'bg-success text-success-foreground';
    case 'assignment':
      return 'bg-primary text-primary-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const Timeline = ({ history, currentLine }: TimelineProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card/50">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Clock className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="text-sm font-semibold text-foreground">Timeline</span>
          <p className="text-xs text-muted-foreground">Step-by-step history</p>
        </div>
        {history.length > 0 && (
          <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {history.length} steps
          </span>
        )}
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        {history.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border rounded-full" />
            
            <div className="space-y-3">
              {history.map((entry, index) => {
                const isLatest = index === history.length - 1;
                const isCurrent = entry.line === currentLine;
                
                return (
                  <div
                    key={`${entry.line}-${entry.timestamp}`}
                    className={cn(
                      "relative flex items-start gap-4 pl-0 animate-fade-in-up"
                    )}
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                  >
                    {/* Timeline node */}
                    <div className={cn(
                      "relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                      isCurrent ? getTypeColor(entry.type) : "bg-card border-2 border-border"
                    )}>
                      {isCurrent ? (
                        getTypeIcon(entry.type)
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "flex-1 soft-panel p-3 transition-all duration-300",
                      isCurrent && "ring-2 ring-primary/20 bg-primary/5"
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs font-semibold",
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        )}>
                          Line {entry.line}
                        </span>
                        {entry.type && (
                          <span className={cn(
                            "text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded",
                            isCurrent 
                              ? getTypeColor(entry.type)
                              : "bg-muted text-muted-foreground"
                          )}>
                            {entry.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground mb-1">No steps yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Run" or "Step" to start
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
