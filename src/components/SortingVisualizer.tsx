import { useEffect, useState, useRef, useCallback } from 'react';
import { SortingEngine } from '@/core/SortingEngine';
import { SortingStep, SortingAlgorithm } from '@/core/sortingTypes';
import { algorithmDetails } from '@/core/algorithmInfo';
import { AlgorithmDetails } from '@/components/AlgorithmDetails';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, SkipForward, Shuffle, ChevronDown, Zap, Keyboard, Sliders, Moon, Sun } from 'lucide-react';

const ALGORITHMS: { value: SortingAlgorithm; label: string; icon: string }[] = [
  { value: 'bubble', label: 'Bubble Sort', icon: '🫧' },
  { value: 'selection', label: 'Selection Sort', icon: '👆' },
  { value: 'insertion', label: 'Insertion Sort', icon: '📥' },
  { value: 'quick', label: 'Quick Sort', icon: '⚡' },
  { value: 'merge', label: 'Merge Sort', icon: '🔀' },
];

export const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<SortingStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Make the minimum speed slower for more visible swapping
  // Increase the max value for the speed slider logic
  const [speed, setSpeed] = useState(350);
  const [algorithm, setAlgorithm] = useState<SortingAlgorithm>('bubble');
  const [arraySize, setArraySize] = useState(20);
  const [showDetails, setShowDetails] = useState(true);
  const [inputMode, setInputMode] = useState<'random' | 'custom'>('random');
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [caseType, setCaseType] = useState<'random' | 'sorted' | 'reversed'>('random');
  
  const engineRef = useRef(new SortingEngine());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewArray = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const newArray = engineRef.current.generateArray(arraySize);
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setInputError('');
  }, [arraySize]);

  const parseCustomInput = () => {
    const trimmed = customInput.trim();
    if (!trimmed) {
      setInputError('Please enter some numbers');
      return;
    }

    const parts = trimmed.split(/[,\s]+/).filter(Boolean);
    const numbers: number[] = [];

    for (const part of parts) {
      const num = parseInt(part, 10);
      if (isNaN(num)) {
        setInputError(`Invalid number: "${part}"`);
        return;
      }
      if (num < 1 || num > 100) {
        setInputError('Numbers must be between 1 and 100');
        return;
      }
      numbers.push(num);
    }

    if (numbers.length < 2) {
      setInputError('Enter at least 2 numbers');
      return;
    }

    if (numbers.length > 50) {
      setInputError('Maximum 50 numbers allowed');
      return;
    }

    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setArray(numbers);
    setSteps([]);
    setCurrentStep(0);
    setInputError('');
  };

  useEffect(() => {
    generateNewArray();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const startSorting = () => {
    engineRef.current.setArray(array);
    const newSteps = engineRef.current.getSteps(algorithm);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (steps.length === 0) {
      startSorting();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const stepForward = () => {
    if (steps.length === 0) {
      startSorting();
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSteps([]);
    setCurrentStep(0);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, steps.length, speed]);

  const currentData = steps[currentStep] || { array, comparing: [], swapping: [], sorted: [], description: 'Press Play to start visualization', comparisons: 0, swaps: 0 };
  const maxValue = Math.max(...currentData.array, 1);
  const isComplete = currentStep >= steps.length - 1 && steps.length > 0;

  const currentAlgoInfo = algorithmDetails[algorithm];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-card to-background">
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-10">
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground shadow-sm shadow-primary/20 transition hover:border-primary/80 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-foreground" />
            )}
            <span className="hidden sm:inline text-[0.65rem]">
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23888%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium tracking-wide">
              <Zap className="w-3.5 h-3.5" />
              Interactive Learning Tool
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
              Sorting Algorithm
              <span className="block text-primary mt-1">Visualizer</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Watch algorithms work step-by-step. Enter your own data or generate random arrays to see how each sorting method organizes information.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Algorithm Selector */}
        <section aria-label="Algorithm selection">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.value}
                onClick={() => {
                  setAlgorithm(algo.value);
                  reset();
                }}
                className={`
                  group relative px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${algorithm === algo.value 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'bg-card hover:bg-card/80 text-foreground border border-border hover:border-primary/30 hover:shadow-md'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base sm:text-lg">{algo.icon}</span>
                  <span className="hidden sm:inline">{algo.label}</span>
                  <span className="sm:hidden">{algo.label.split(' ')[0]}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Input Mode Toggle & Controls */}
        <section className="glass-panel p-4 sm:p-6 space-y-5">
          {/* Case Type Selector */}
          <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-lg w-fit mx-auto flex-wrap">
            <button
              onClick={() => {
                setCaseType('random');
                setIsPlaying(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                const newArray = engineRef.current.generateArray(arraySize);
                setArray(newArray);
                setSteps([]);
                setCurrentStep(0);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                caseType === 'random' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              🎲 Random
            </button>
            <button
              onClick={() => {
                setCaseType('sorted');
                setIsPlaying(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                const newArray = engineRef.current.generateSortedArray(arraySize);
                setArray(newArray);
                setSteps([]);
                setCurrentStep(0);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                caseType === 'sorted' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ✅ Best Case
            </button>
            <button
              onClick={() => {
                setCaseType('reversed');
                setIsPlaying(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                const newArray = engineRef.current.generateReverseSortedArray(arraySize);
                setArray(newArray);
                setSteps([]);
                setCurrentStep(0);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                caseType === 'reversed' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              ⚠️ Worst Case
            </button>
          </div>
          {/* Input Mode Tabs */}
          <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-lg w-fit mx-auto">
            <button
              onClick={() => setInputMode('random')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === 'random' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Random Array
            </button>
            <button
              onClick={() => setInputMode('custom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                inputMode === 'custom' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Custom Input
            </button>
          </div>

          {/* Input Section */}
          {inputMode === 'random' ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Size</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={arraySize}
                    onChange={(e) => setArraySize(Number(e.target.value))}
                    className="flex-1 sm:w-24 md:w-32 accent-primary h-2 rounded-full cursor-pointer"
                  />
                  <span className="text-sm font-mono text-foreground bg-muted px-2.5 py-1 rounded-md min-w-[40px] text-center">{arraySize}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Speed</label>
                  <input
                    type="range"
                    min="20"
                    max="400"
                    step="20"
                    value={700 - speed}
                    onChange={(e) => setSpeed(700 - Number(e.target.value))}
                    className="flex-1 sm:w-24 md:w-32 accent-primary h-2 rounded-full cursor-pointer"
                  />
                  <span className="text-xs font-medium text-muted-foreground min-w-[50px]">
                    {speed < 200 ? '🚀 Fast' : speed < 400 ? '⚡ Medium' : '🐢 Slow'}
                  </span>
                </div>
              </div>

              <Button onClick={generateNewArray} variant="outline" className="gap-2 w-full sm:w-auto">
                <Shuffle className="w-4 h-4" />
                Generate
              </Button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-3">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Enter numbers (e.g., 64, 34, 25)"
                      value={customInput}
                      onChange={(e) => {
                        setCustomInput(e.target.value);
                        setInputError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && parseCustomInput()}
                      className="w-full font-mono text-sm"
                    />
                  </div>
                  <Button onClick={parseCustomInput} className="gap-2 w-full sm:w-auto shrink-0">
                    <Play className="w-4 h-4" />
                    Apply
                  </Button>
                </div>
                {inputError && (
                  <p className="text-sm text-destructive text-center">{inputError}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Enter comma or space-separated numbers between 1-100 (max 50)
              </p>
              
              {/* Speed control for custom mode */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <label className="text-sm font-medium text-muted-foreground">Speed</label>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="20"
                  value={700 - speed}
                  onChange={(e) => setSpeed(700 - Number(e.target.value))}
                  className="w-full sm:w-32 accent-primary h-2 rounded-full cursor-pointer"
                />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {speed < 200 ? '🚀 Fast' : speed < 400 ? '⚡ Medium' : '🐢 Slow'}
                </span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              onClick={togglePlay}
              size="lg"
              className="gap-2 w-full sm:w-auto sm:min-w-[130px] shadow-lg shadow-primary/20"
              disabled={isComplete || array.length === 0}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : steps.length > 0 ? 'Resume' : 'Start'}
            </Button>
            
            <Button
              onClick={stepForward}
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              disabled={isComplete || array.length === 0}
            >
              <SkipForward className="w-4 h-4" />
              Step
            </Button>
            
            <Button
              onClick={reset}
              variant="outline"
              size="lg"
              className="gap-2 w-full sm:w-auto"
              disabled={steps.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </section>

        {/* Visualization Area */}
        <section className="glass-panel p-6 sm:p-8 relative overflow-hidden" aria-label="Sorting visualization">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          <div className="relative">
            {/* Status Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isPlaying ? 'bg-primary animate-pulse' : isComplete ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                <span className="font-medium text-foreground text-sm sm:text-base">
                  {isComplete ? '✓ Sorting Complete!' : currentData.description}
                </span>
              </div>
              {steps.length > 0 && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-md">
                  <span className="text-foreground font-semibold">{currentStep + 1}</span>
                  <span>/</span>
                  <span>{steps.length}</span>
                  <span className="text-muted-foreground">steps</span>
                </div>
              )}
              {steps.length > 0 && currentData.comparisons !== undefined && (
                <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground font-mono">
                  <div className="bg-muted/50 px-3 py-1 rounded-md">
                    <span className="text-secondary font-semibold">{currentData.comparisons}</span>
                    <span> comparisons</span>
                  </div>
                  <div className="bg-muted/50 px-3 py-1 rounded-md">
                    <span className="text-accent font-semibold">{currentData.swaps}</span>
                    <span> swaps</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bars */}
            <div className="flex items-end justify-center gap-[2px] sm:gap-[3px] lg:gap-1 h-48 sm:h-64 md:h-80 lg:h-96 pt-6">
              {currentData.array.map((value, idx) => {
                const isComparing = currentData.comparing.includes(idx);
                const isSwapping = currentData.swapping.includes(idx);
                const isSorted = currentData.sorted.includes(idx);
                const heightPercent = (value / maxValue) * 100;
                const barCount = currentData.array.length;
                
                return (
                  <div
                    key={idx}
                    className="relative flex-1 h-full flex flex-col justify-end items-center group"
                    style={{ maxWidth: barCount > 30 ? '12px' : barCount > 20 ? '16px' : '32px' }}
                  >
                    {/* Value label */}
                    <span className={`
                      mb-0.5 font-mono font-semibold transition-all duration-150 leading-none
                      ${isSwapping ? 'text-accent scale-110' : isComparing ? 'text-secondary' : 'text-muted-foreground'}
                      ${barCount > 35 ? 'text-[6px] sm:text-[8px]' : barCount > 25 ? 'text-[8px] sm:text-[10px]' : 'text-[9px] sm:text-xs'}
                    `}>
                      {value}
                    </span>
                    
                    {/* Bar */}
                    <div
                      className={`
                        w-full rounded-t transition-all duration-150 relative overflow-hidden
                        ${isSwapping 
                          ? 'bg-accent shadow-lg shadow-accent/50 scale-x-110' 
                          : isComparing 
                            ? 'bg-secondary shadow-md shadow-secondary/40' 
                            : isSorted 
                              ? 'bg-primary shadow-sm shadow-primary/30' 
                              : 'bg-muted-foreground/30'
                        }
                      `}
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: '4px',
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
                <span className="text-xs sm:text-sm text-muted-foreground">Unsorted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-secondary shadow-sm" />
                <span className="text-xs sm:text-sm text-muted-foreground">Comparing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-accent shadow-sm" />
                <span className="text-xs sm:text-sm text-muted-foreground">Swapping</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-primary shadow-sm" />
                <span className="text-xs sm:text-sm text-muted-foreground">Sorted</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {steps.length > 0 && (
            <div className="mt-6 h-1 bg-muted/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-200 rounded-full"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          )}
        </section>

        {/* Algorithm Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 py-3 text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span className="text-sm font-medium">
            {showDetails ? 'Hide' : 'Show'} Algorithm Details
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {/* Algorithm Details */}
        {showDetails && (
          <section className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                {currentAlgoInfo.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Understanding the algorithm</p>
            </div>
            <AlgorithmDetails info={currentAlgoInfo} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center gap-2">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            Built with <span className="font-semibold">React</span> & <span className="font-semibold">TypeScript</span> • Interactive Algorithm Learning
          </p>
          <div className="flex gap-4 mt-2">
            <a href="https://github.com/abhi9vaidya" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-primary transition-colors">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.338 4.695-4.566 4.944.36.31.68.921.68 1.857 0 1.34-.012 2.422-.012 2.753 0 .268.18.579.688.481C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" /></svg>
            </a>
            <a href="https://www.linkedin.com/in/abhinav-vaidya-718843211/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-primary transition-colors">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8a6 6 0 016 6v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a2 2 0 00-4 0v4a1 1 0 01-1 1H7a1 1 0 01-1-1v-9a1 1 0 011-1h4a1 1 0 011 1v1.528A6.002 6.002 0 0116 8zM5 20a2 2 0 100-4 2 2 0 000 4zM5 8a2 2 0 100-4 2 2 0 000 4z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};