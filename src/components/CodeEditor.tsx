import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  currentLine: number;
  isRunning: boolean;
}

const CodeEditor = ({ code, onCodeChange, currentLine, isRunning }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    monaco.editor.defineTheme('visualizer-warm', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '9ca3af', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e07a3d' },
        { token: 'string', foreground: '2e9e6e' },
        { token: 'number', foreground: 'd97706' },
        { token: 'function', foreground: '7c3aed' },
        { token: 'variable', foreground: 'db2777' },
        { token: 'type', foreground: '2563eb' },
      ],
      colors: {
        'editor.background': '#faf8f5',
        'editor.foreground': '#3d3d3d',
        'editor.lineHighlightBackground': '#f3f0eb',
        'editor.selectionBackground': '#e07a3d30',
        'editorCursor.foreground': '#e07a3d',
        'editorLineNumber.foreground': '#b0a99f',
        'editorLineNumber.activeForeground': '#e07a3d',
        'editor.inactiveSelectionBackground': '#e07a3d20',
      },
    });
    
    monaco.editor.setTheme('visualizer-warm');
  };

  const updateHighlight = () => {
    if (!editorRef.current || currentLine <= 0) return;
    
    const monaco = (window as any).monaco;
    if (!monaco) return;

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      currentLine > 0 ? [{
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'editor-highlight',
          glyphMarginClassName: 'line-glyph-warm',
          linesDecorationsClassName: 'line-decoration-warm',
        },
      }] : []
    );

    editorRef.current.revealLineInCenter(currentLine);
  };

  if (editorRef.current && currentLine > 0) {
    setTimeout(updateHighlight, 50);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onCodeChange(content);
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">Your Code</span>
            <p className="text-xs text-muted-foreground">Edit or upload a file</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.go,.rb,.php,.swift,.kt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isRunning}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 relative bg-[#faf8f5]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            lineHeight: 26,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 20, bottom: 20 },
            readOnly: isRunning,
            wordWrap: 'on',
            automaticLayout: true,
            glyphMargin: true,
            folding: true,
            lineNumbersMinChars: 3,
            roundedSelection: true,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-card">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading editor...</span>
              </div>
            </div>
          }
        />
        
        <style>{`
          .editor-highlight {
            background: linear-gradient(90deg, hsl(24 80% 55% / 0.12), transparent) !important;
            border-left: 3px solid hsl(24 80% 55%) !important;
          }
          .line-glyph-warm {
            background: hsl(24 80% 55%);
            border-radius: 3px;
            margin-left: 3px;
            width: 4px !important;
          }
          .line-decoration-warm {
            background: hsl(24 80% 55% / 0.15);
          }
        `}</style>
      </div>
    </div>
  );
};

export default CodeEditor;
