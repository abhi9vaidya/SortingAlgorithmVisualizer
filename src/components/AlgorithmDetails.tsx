import { AlgorithmInfo } from '@/core/algorithmInfo';
import { Clock, HardDrive, CheckCircle, XCircle, Lightbulb, Code2 } from 'lucide-react';

interface AlgorithmDetailsProps {
  info: AlgorithmInfo;
}

export const AlgorithmDetails = ({ info }: AlgorithmDetailsProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Description */}
      <div className="glass-panel p-5">
        <p className="text-foreground leading-relaxed">{info.description}</p>
      </div>

      {/* Complexity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Time Complexity */}
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Time Complexity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best:</span>
              <code className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                {info.timeComplexity.best}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average:</span>
              <code className="font-mono text-secondary bg-secondary/20 px-2 py-0.5 rounded">
                {info.timeComplexity.average}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Worst:</span>
              <code className="font-mono text-accent bg-accent/20 px-2 py-0.5 rounded">
                {info.timeComplexity.worst}
              </code>
            </div>
          </div>
        </div>

        {/* Space Complexity */}
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-secondary/20">
              <HardDrive className="w-4 h-4 text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">Space Complexity</h3>
          </div>
          <div className="flex items-center justify-center h-16">
            <code className="font-mono text-2xl font-bold text-secondary">
              {info.spaceComplexity}
            </code>
          </div>
        </div>

        {/* Stability */}
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${info.stable ? 'bg-primary/20' : 'bg-accent/20'}`}>
              {info.stable ? (
                <CheckCircle className="w-4 h-4 text-primary" />
              ) : (
                <XCircle className="w-4 h-4 text-accent" />
              )}
            </div>
            <h3 className="font-semibold text-foreground">Stability</h3>
          </div>
          <div className="flex items-center justify-center h-16">
            <span className={`text-lg font-semibold ${info.stable ? 'text-primary' : 'text-accent'}`}>
              {info.stable ? 'Stable' : 'Unstable'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {info.stable 
              ? 'Maintains relative order of equal elements'
              : 'May change order of equal elements'
            }
          </p>
        </div>

        {/* Use Case */}
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/20">
              <Lightbulb className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Best For</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {info.name === 'Bubble Sort' && 'Educational purposes, small datasets, nearly sorted arrays'}
            {info.name === 'Selection Sort' && 'Small datasets, when memory writes are expensive'}
            {info.name === 'Insertion Sort' && 'Small or nearly sorted datasets, online sorting'}
            {info.name === 'Quick Sort' && 'General purpose, large datasets, cache-efficient'}
            {info.name === 'Merge Sort' && 'Linked lists, external sorting, when stability matters'}
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">How It Works</h3>
        </div>
        <ol className="space-y-2">
          {info.howItWorks.map((step, idx) => (
            <li key={idx} className="flex gap-3 items-start">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-medium flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="text-foreground pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Code Implementation */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-secondary/20">
            <Code2 className="w-4 h-4 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Implementation</h3>
        </div>
        <div className="relative">
          <pre className="bg-card/80 border border-border rounded-xl p-4 overflow-x-auto">
            <code className="text-sm font-mono text-foreground leading-relaxed whitespace-pre">
              {info.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
