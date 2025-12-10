export interface Variable {
  name: string;
  value: any;
  type: string;
  changed?: boolean;
}

export interface HistoryEntry {
  line: number;
  description: string;
  timestamp: number;
  type?: 'loop' | 'condition' | 'assignment' | 'output' | 'other';
}

export interface LoopState {
  id: string;
  variable: string;
  current: number;
  max: number;
  iterations: number[];
  isActive: boolean;
}

export interface ExecutionStep {
  currentLine: number;
  variables: Variable[];
  callStack: string[];
  history: HistoryEntry[];
  output: string[];
  error?: string;
  isComplete: boolean;
  loops: LoopState[];
}

export interface ParsedLine {
  lineNumber: number;
  type: 'declaration' | 'assignment' | 'conditional' | 'loop' | 'function-call' | 'function-def' | 'return' | 'output' | 'other';
  content: string;
  indent: number;
}

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';
