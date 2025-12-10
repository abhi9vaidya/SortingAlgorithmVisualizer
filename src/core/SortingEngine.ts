import { SortingStep, SortingAlgorithm } from './sortingTypes';

export class SortingEngine {
  private steps: SortingStep[] = [];
  private originalArray: number[] = [];
  private comparisonCount: number = 0;
  private swapCount: number = 0;

  generateArray(size: number = 15): number[] {
    this.originalArray = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 5);
    return [...this.originalArray];
  }

  generateSortedArray(size: number = 15): number[] {
    this.originalArray = Array.from({ length: size }, (_, i) => (i + 1) * 5);
    return [...this.originalArray];
  }

  generateReverseSortedArray(size: number = 15): number[] {
    this.originalArray = Array.from({ length: size }, (_, i) => (size - i) * 5);
    return [...this.originalArray];
  }

  setArray(arr: number[]): void {
    this.originalArray = [...arr];
  }

  getSteps(algorithm: SortingAlgorithm): SortingStep[] {
    this.steps = [];
    this.comparisonCount = 0;
    this.swapCount = 0;
    const arr = [...this.originalArray];

    switch (algorithm) {
      case 'bubble':
        this.bubbleSort(arr);
        break;
      case 'selection':
        this.selectionSort(arr);
        break;
      case 'insertion':
        this.insertionSort(arr);
        break;
      case 'quick':
        this.quickSort(arr, 0, arr.length - 1);
        this.addStep(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), 'Quick sort complete!');
        break;
      case 'merge':
        this.mergeSort(arr, 0, arr.length - 1);
        this.addStep(arr, [], [], Array.from({ length: arr.length }, (_, i) => i), 'Merge sort complete!');
        break;
    }

    return this.steps;
  }

  private addStep(array: number[], comparing: number[], swapping: number[], sorted: number[], description: string): void {
    if (comparing.length > 0) this.comparisonCount++;
    if (swapping.length > 0) this.swapCount++;
    
    this.steps.push({
      array: [...array],
      comparing: [...comparing],
      swapping: [...swapping],
      sorted: [...sorted],
      description,
      comparisons: this.comparisonCount,
      swaps: this.swapCount
    });
  }

  private bubbleSort(arr: number[]): void {
    const n = arr.length;
    const sorted: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        this.addStep(arr, [j, j + 1], [], sorted, `Comparing ${arr[j]} and ${arr[j + 1]}`);
        
        if (arr[j] > arr[j + 1]) {
          this.addStep(arr, [], [j, j + 1], sorted, `Swapping ${arr[j]} and ${arr[j + 1]}`);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          this.addStep(arr, [], [], sorted, `Swapped!`);
        }
      }
      sorted.unshift(n - 1 - i);
    }
    sorted.unshift(0);
    this.addStep(arr, [], [], sorted, 'Bubble sort complete!');
  }

  private selectionSort(arr: number[]): void {
    const n = arr.length;
    const sorted: number[] = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      
      for (let j = i + 1; j < n; j++) {
        this.addStep(arr, [minIdx, j], [], sorted, `Comparing ${arr[minIdx]} with ${arr[j]}`);
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.addStep(arr, [minIdx], [], sorted, `New minimum found: ${arr[minIdx]}`);
        }
      }

      if (minIdx !== i) {
        this.addStep(arr, [], [i, minIdx], sorted, `Swapping ${arr[i]} and ${arr[minIdx]}`);
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      }
      
      sorted.push(i);
      this.addStep(arr, [], [], sorted, `Position ${i} is now sorted`);
    }
    sorted.push(n - 1);
    this.addStep(arr, [], [], sorted, 'Selection sort complete!');
  }

  private insertionSort(arr: number[]): void {
    const n = arr.length;
    const sorted: number[] = [0];

    this.addStep(arr, [], [], sorted, `Starting with first element as sorted`);

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      
      this.addStep(arr, [i], [], sorted, `Inserting ${key} into sorted portion`);

      while (j >= 0 && arr[j] > key) {
        this.addStep(arr, [j, j + 1], [], sorted, `${arr[j]} > ${key}, shifting right`);
        arr[j + 1] = arr[j];
        this.addStep(arr, [], [j, j + 1], sorted, `Shifted ${arr[j]}`);
        j--;
      }
      
      arr[j + 1] = key;
      sorted.push(i);
      this.addStep(arr, [], [], sorted, `Inserted ${key} at position ${j + 1}`);
    }
    
    this.addStep(arr, [], [], sorted, 'Insertion sort complete!');
  }

  private quickSort(arr: number[], low: number, high: number): void {
    if (low < high) {
      const pi = this.partition(arr, low, high);
      this.quickSort(arr, low, pi - 1);
      this.quickSort(arr, pi + 1, high);
    }
  }

  private partition(arr: number[], low: number, high: number): number {
    const pivot = arr[high];
    this.addStep(arr, [high], [], [], `Pivot selected: ${pivot}`);
    
    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.addStep(arr, [j, high], [], [], `Comparing ${arr[j]} with pivot ${pivot}`);
      
      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          this.addStep(arr, [], [i, j], [], `Swapping ${arr[i]} and ${arr[j]}`);
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.addStep(arr, [], [], [], `Swapped!`);
        }
      }
    }

    this.addStep(arr, [], [i + 1, high], [], `Placing pivot ${pivot} in correct position`);
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    this.addStep(arr, [], [], [i + 1], `Pivot ${pivot} is now in place`);
    
    return i + 1;
  }

  private mergeSort(arr: number[], left: number, right: number): void {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      this.addStep(arr, [], [], [], `Dividing: [${left}...${mid}] and [${mid + 1}...${right}]`);
      
      this.mergeSort(arr, left, mid);
      this.mergeSort(arr, mid + 1, right);
      this.merge(arr, left, mid, right);
    }
  }

  private merge(arr: number[], left: number, mid: number, right: number): void {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    
    let i = 0, j = 0, k = left;
    
    this.addStep(arr, [], [], [], `Merging [${leftArr.join(', ')}] and [${rightArr.join(', ')}]`);

    while (i < leftArr.length && j < rightArr.length) {
      this.addStep(arr, [left + i, mid + 1 + j], [], [], `Comparing ${leftArr[i]} and ${rightArr[j]}`);
      
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }
      k++;
      this.addStep(arr, [], [], [], `Placed ${arr[k - 1]}`);
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      j++;
      k++;
    }

    this.addStep(arr, [], [], [], `Merged section: [${arr.slice(left, right + 1).join(', ')}]`);
  }
}
