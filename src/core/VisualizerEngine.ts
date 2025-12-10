import { Variable, HistoryEntry, ExecutionStep, ParsedLine, ExecutionStatus, LoopState } from './types';

export class VisualizerEngine {
  private sourceCode: string = '';
  private lines: string[] = [];
  private parsedLines: ParsedLine[] = [];
  private currentLineIndex: number = -1;
  private variables: Map<string, { value: any; type: string }> = new Map();
  private callStack: string[] = ['main'];
  private history: HistoryEntry[] = [];
  private output: string[] = [];
  private status: ExecutionStatus = 'idle';
  private error: string | undefined;
  private loops: Map<string, LoopState> = new Map();
  private loopCounter: number = 0;

  loadCode(source: string): void {
    this.sourceCode = source;
    this.lines = source.split('\n');
    this.parsedLines = this.parseLines();
    this.reset();
  }

  private parseLines(): ParsedLine[] {
    return this.lines.map((line, index) => {
      const trimmed = line.trim();
      const indent = line.search(/\S|$/);
      
      let type: ParsedLine['type'] = 'other';
      
      if (/^(let|const|var)\s+\w+/.test(trimmed)) {
        type = 'declaration';
      } else if (/^\w+\s*=/.test(trimmed) && !/^(let|const|var)/.test(trimmed)) {
        type = 'assignment';
      } else if (/^(if|else if|else)\s*[\({]?/.test(trimmed)) {
        type = 'conditional';
      } else if (/^(for|while|do)\s*[\({]?/.test(trimmed)) {
        type = 'loop';
      } else if (/^function\s+\w+|^\w+\s*=\s*(async\s*)?\(.*\)\s*=>/.test(trimmed)) {
        type = 'function-def';
      } else if (/^return\s/.test(trimmed)) {
        type = 'return';
      } else if (/console\.(log|warn|error)\(/.test(trimmed)) {
        type = 'output';
      } else if (/\w+\(.*\)/.test(trimmed) && !trimmed.startsWith('//')) {
        type = 'function-call';
      }

      return {
        lineNumber: index + 1,
        type,
        content: trimmed,
        indent,
      };
    });
  }

  reset(): void {
    this.currentLineIndex = -1;
    this.variables.clear();
    this.callStack = ['main'];
    this.history = [];
    this.output = [];
    this.status = 'idle';
    this.error = undefined;
    this.loops.clear();
    this.loopCounter = 0;
  }

  private findNextExecutableLine(): number {
    for (let i = this.currentLineIndex + 1; i < this.parsedLines.length; i++) {
      const line = this.parsedLines[i];
      if (line.content && !line.content.startsWith('//') && line.content !== '{' && line.content !== '}') {
        return i;
      }
    }
    return -1;
  }

  private simulateLine(parsed: ParsedLine): void {
    const content = parsed.content;

    try {
      // Handle variable declarations
      const declMatch = content.match(/^(let|const|var)\s+(\w+)\s*=\s*(.+?);?$/);
      if (declMatch) {
        const [, , name, valueExpr] = declMatch;
        const value = this.evaluateExpression(valueExpr);
        const type = typeof value;
        this.variables.set(name, { value, type });
        this.addHistoryEntry(parsed.lineNumber, `Set ${name} = ${JSON.stringify(value)}`, 'assignment');
        return;
      }

      // Handle assignments
      const assignMatch = content.match(/^(\w+)\s*=\s*(.+?);?$/);
      if (assignMatch && parsed.type === 'assignment') {
        const [, name, valueExpr] = assignMatch;
        const oldValue = this.variables.get(name)?.value;
        const value = this.evaluateExpression(valueExpr);
        const type = typeof value;
        this.variables.set(name, { value, type });
        
        // Check if this is a loop counter update
        this.loops.forEach((loop, loopId) => {
          if (loop.variable === name && typeof value === 'number') {
            loop.current = value;
            loop.iterations.push(value);
          }
        });
        
        this.addHistoryEntry(parsed.lineNumber, `${name}: ${oldValue} → ${value}`, 'assignment');
        return;
      }

      // Handle console.log
      const logMatch = content.match(/console\.(log|warn|error)\((.+)\)/);
      if (logMatch) {
        const [, method, argsStr] = logMatch;
        const value = this.evaluateExpression(argsStr);
        this.output.push(String(value));
        this.addHistoryEntry(parsed.lineNumber, `Output: ${value}`, 'output');
        return;
      }

      // Handle conditionals
      if (parsed.type === 'conditional') {
        const condMatch = content.match(/if\s*\((.+)\)/);
        if (condMatch) {
          const condition = this.evaluateExpression(condMatch[1]);
          this.addHistoryEntry(parsed.lineNumber, `Condition: ${condition ? '✓ true' : '✗ false'}`, 'condition');
          return;
        }
        this.addHistoryEntry(parsed.lineNumber, `Else branch`, 'condition');
        return;
      }

      // Handle loops
      if (parsed.type === 'loop') {
        const whileMatch = content.match(/while\s*\((.+)\)/);
        if (whileMatch) {
          const varMatch = whileMatch[1].match(/(\w+)\s*[<>=]/);
          const limitMatch = whileMatch[1].match(/[<>=]\s*(\d+)/);
          
          if (varMatch && limitMatch) {
            const loopVar = varMatch[1];
            const limit = parseInt(limitMatch[1]);
            const currentVal = this.variables.get(loopVar)?.value ?? 0;
            
            const loopId = `loop_${this.loopCounter++}`;
            this.loops.set(loopId, {
              id: loopId,
              variable: loopVar,
              current: currentVal,
              max: limit,
              iterations: [currentVal],
              isActive: true,
            });
          }
          
          const condition = this.evaluateExpression(whileMatch[1]);
          this.addHistoryEntry(parsed.lineNumber, `Loop: ${condition ? 'continuing' : 'finished'}`, 'loop');
          return;
        }

        const forMatch = content.match(/for\s*\((.+?);(.+?);(.+?)\)/);
        if (forMatch) {
          const initMatch = forMatch[1].match(/(\w+)\s*=\s*(\d+)/);
          const condMatch = forMatch[2].match(/(\w+)\s*[<>=]+\s*(\d+)/);
          
          if (initMatch && condMatch) {
            const loopVar = initMatch[1];
            const startVal = parseInt(initMatch[2]);
            const limit = parseInt(condMatch[2]);
            
            this.variables.set(loopVar, { value: startVal, type: 'number' });
            
            const loopId = `loop_${this.loopCounter++}`;
            this.loops.set(loopId, {
              id: loopId,
              variable: loopVar,
              current: startVal,
              max: limit,
              iterations: [startVal],
              isActive: true,
            });
          }
          
          this.addHistoryEntry(parsed.lineNumber, `Loop started`, 'loop');
          return;
        }
        
        this.addHistoryEntry(parsed.lineNumber, `Loop iteration`, 'loop');
        return;
      }

      // Handle function definitions
      if (parsed.type === 'function-def') {
        const funcMatch = content.match(/function\s+(\w+)/);
        if (funcMatch) {
          this.addHistoryEntry(parsed.lineNumber, `Function: ${funcMatch[1]}`, 'other');
          return;
        }
      }

      // Handle return statements
      if (parsed.type === 'return') {
        const returnMatch = content.match(/return\s+(.+?);?$/);
        if (returnMatch) {
          const value = this.evaluateExpression(returnMatch[1]);
          this.addHistoryEntry(parsed.lineNumber, `Return: ${JSON.stringify(value)}`, 'other');
          return;
        }
      }

      // Handle function calls
      if (parsed.type === 'function-call') {
        const funcCallMatch = content.match(/(\w+)\(/);
        if (funcCallMatch) {
          this.addHistoryEntry(parsed.lineNumber, `Called: ${funcCallMatch[1]}()`, 'other');
          return;
        }
      }

      // Default
      if (content && !content.startsWith('//')) {
        this.addHistoryEntry(parsed.lineNumber, `Line ${parsed.lineNumber}`, 'other');
      }

    } catch (err) {
      this.error = `Error at line ${parsed.lineNumber}: ${err instanceof Error ? err.message : String(err)}`;
      this.status = 'error';
    }
  }

  private evaluateExpression(expr: string): any {
    const trimmed = expr.trim();
    
    const stringMatch = trimmed.match(/^["'`](.*)["'`]$/);
    if (stringMatch) {
      return stringMatch[1];
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return parseFloat(trimmed);
    }

    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return trimmed;
      }
    }

    if (/^\w+$/.test(trimmed)) {
      const varData = this.variables.get(trimmed);
      if (varData) {
        return varData.value;
      }
      return `<undefined: ${trimmed}>`;
    }

    const arithMatch = trimmed.match(/^(\w+|\d+)\s*([+\-*/%])\s*(\w+|\d+)$/);
    if (arithMatch) {
      const [, left, op, right] = arithMatch;
      const leftVal = this.evaluateExpression(left);
      const rightVal = this.evaluateExpression(right);
      
      if (typeof leftVal === 'number' && typeof rightVal === 'number') {
        switch (op) {
          case '+': return leftVal + rightVal;
          case '-': return leftVal - rightVal;
          case '*': return leftVal * rightVal;
          case '/': return leftVal / rightVal;
          case '%': return leftVal % rightVal;
        }
      }
      if (op === '+') {
        return String(leftVal) + String(rightVal);
      }
    }

    const compMatch = trimmed.match(/^(.+?)\s*(===|!==|==|!=|<=|>=|<|>)\s*(.+)$/);
    if (compMatch) {
      const [, left, op, right] = compMatch;
      const leftVal = this.evaluateExpression(left.trim());
      const rightVal = this.evaluateExpression(right.trim());
      
      switch (op) {
        case '===': return leftVal === rightVal;
        case '!==': return leftVal !== rightVal;
        case '==': return leftVal == rightVal;
        case '!=': return leftVal != rightVal;
        case '<': return leftVal < rightVal;
        case '>': return leftVal > rightVal;
        case '<=': return leftVal <= rightVal;
        case '>=': return leftVal >= rightVal;
      }
    }

    return trimmed;
  }

  private addHistoryEntry(line: number, description: string, type: HistoryEntry['type'] = 'other'): void {
    this.history.push({
      line,
      description,
      timestamp: Date.now(),
      type,
    });
  }

  nextStep(): ExecutionStep {
    if (this.status === 'error') {
      return this.getCurrentState();
    }

    const nextIndex = this.findNextExecutableLine();
    
    if (nextIndex === -1) {
      this.status = 'complete';
      this.loops.forEach(loop => loop.isActive = false);
      return this.getCurrentState();
    }

    this.currentLineIndex = nextIndex;
    const currentParsed = this.parsedLines[this.currentLineIndex];
    
    const prevVars = new Map(this.variables);
    
    this.simulateLine(currentParsed);
    this.status = 'running';

    return this.getCurrentState(prevVars);
  }

  getCurrentState(prevVars?: Map<string, { value: any; type: string }>): ExecutionStep {
    const variables: Variable[] = [];
    
    this.variables.forEach((data, name) => {
      const prevData = prevVars?.get(name);
      const changed = prevVars ? (!prevData || prevData.value !== data.value) : false;
      
      variables.push({
        name,
        value: data.value,
        type: data.type,
        changed,
      });
    });

    const loops: LoopState[] = Array.from(this.loops.values());

    return {
      currentLine: this.currentLineIndex >= 0 ? this.parsedLines[this.currentLineIndex].lineNumber : 0,
      variables,
      callStack: [...this.callStack],
      history: [...this.history],
      output: [...this.output],
      error: this.error,
      isComplete: this.status === 'complete',
      loops,
    };
  }

  getStatus(): ExecutionStatus {
    return this.status;
  }

  getLineCount(): number {
    return this.lines.length;
  }

  getSourceCode(): string {
    return this.sourceCode;
  }
}

export const createVisualizerEngine = (): VisualizerEngine => {
  return new VisualizerEngine();
};
