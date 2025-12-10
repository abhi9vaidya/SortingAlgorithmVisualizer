export interface SortingStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  description: string;
  comparisons?: number;
  swaps?: number;
}

export interface SortingState {
  steps: SortingStep[];
  currentStep: number;
  algorithm: string;
  isComplete: boolean;
}

export type SortingAlgorithm = 'bubble' | 'selection' | 'insertion' | 'quick' | 'merge';
