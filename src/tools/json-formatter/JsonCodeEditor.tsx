import { useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { linter, lintGutter, type Diagnostic } from '@codemirror/lint';
import { indentWithTab } from '@codemirror/commands';
import { basicSetup } from 'codemirror';

function jsonLinter() {
  return linter((view): readonly Diagnostic[] => {
    const text = view.state.doc.toString();
    if (!text.trim()) return [];
    try {
      JSON.parse(text);
      return [];
    } catch (e) {
      if (!(e instanceof SyntaxError)) return [];
      const posMatch = e.message.match(/at position (\d+)/);
      const from = posMatch ? Math.min(parseInt(posMatch[1], 10), text.length - 1) : 0;
      const to = Math.min(from + 1, text.length);
      return [{ from, to, severity: 'error', message: e.message }];
    }
  });
}

interface JsonCodeEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export function JsonCodeEditor({ initialValue, onChange }: JsonCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        basicSetup,
        json(),
        jsonLinter(),
        lintGutter(),
        keymap.of([indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { minHeight: '180px' },
          '.cm-scroller': { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', lineHeight: '1.5' },
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={containerRef} className="json-cm-editor" />;
}
