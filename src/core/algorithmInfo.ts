import { SortingAlgorithm } from './sortingTypes';

export interface AlgorithmInfo {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  stable: boolean;
  code: string;
  howItWorks: string[];
}

export const algorithmDetails: Record<SortingAlgorithm, AlgorithmInfo> = {
  bubble: {
    name: 'Bubble Sort',
    description: 'A simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: true,
    code: `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j + 1]) {
        // Swap them
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}`,
    howItWorks: [
      'Start from the first element',
      'Compare it with the next element',
      'If the first is greater, swap them',
      'Move to the next pair and repeat',
      'After each pass, the largest unsorted element "bubbles up" to its correct position',
      'Repeat until no swaps are needed',
    ],
  },
  selection: {
    name: 'Selection Sort',
    description: 'An in-place comparison sorting algorithm that divides the input into a sorted and unsorted region, repeatedly selecting the smallest element from the unsorted region.',
    timeComplexity: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: false,
    code: `function selectionSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    // Find minimum element in unsorted portion
    let minIdx = i;
    
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    
    // Swap minimum with first unsorted element
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  
  return arr;
}`,
    howItWorks: [
      'Divide the array into sorted (left) and unsorted (right) portions',
      'Find the minimum element in the unsorted portion',
      'Swap it with the first unsorted element',
      'Move the boundary one element to the right',
      'Repeat until the entire array is sorted',
    ],
  },
  insertion: {
    name: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time by repeatedly picking the next element and inserting it into its correct position among the previously sorted elements.',
    timeComplexity: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(1)',
    stable: true,
    code: `function insertionSort(arr) {
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    // Pick the element to be inserted
    const key = arr[i];
    let j = i - 1;
    
    // Shift elements greater than key to the right
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    
    // Insert key at correct position
    arr[j + 1] = key;
  }
  
  return arr;
}`,
    howItWorks: [
      'Start with the second element (first element is already "sorted")',
      'Compare it with elements in the sorted portion',
      'Shift larger elements one position to the right',
      'Insert the current element in its correct position',
      'Move to the next element and repeat',
      'Like sorting playing cards in your hand',
    ],
  },
  quick: {
    name: 'Quick Sort',
    description: 'A highly efficient divide-and-conquer algorithm that selects a "pivot" element and partitions the array around it, recursively sorting the sub-arrays.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    spaceComplexity: 'O(log n)',
    stable: false,
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    // Partition and get pivot index
    const pivotIdx = partition(arr, low, high);
    
    // Recursively sort left and right of pivot
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high]; // Choose last element as pivot
  let i = low - 1;
  
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    howItWorks: [
      'Choose a pivot element (usually the last element)',
      'Partition: place smaller elements left, larger elements right',
      'The pivot is now in its final sorted position',
      'Recursively apply to left and right sub-arrays',
      'Base case: arrays of size 0 or 1 are already sorted',
      'Combine: no work needed, array is sorted in place',
    ],
  },
  merge: {
    name: 'Merge Sort',
    description: 'A stable divide-and-conquer algorithm that divides the array into halves, recursively sorts them, and then merges the sorted halves back together.',
    timeComplexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    spaceComplexity: 'O(n)',
    stable: true,
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  // Divide
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  // Merge
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
    howItWorks: [
      'Divide the array into two halves',
      'Recursively sort each half',
      'Merge the two sorted halves',
      'Compare elements from both halves one by one',
      'Place the smaller element in the result array',
      'Continue until all elements are merged',
    ],
  },
};
