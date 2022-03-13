import { useMonacoEditor } from './Base';
import { Range, editor, Position, Selection as EditorSelection } from 'monaco-editor';
import { useCallback, useEffect, useRef } from 'react';
import { Cursor, Selection } from '~/scripts/chat-connection';
import { cursorSuffix, selectionSuffix, suffix } from '~/scripts/room-mates';

const defaultValue = ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n');

type Reflectors = {
  edits: (chages: editor.IModelContentChange[], fullText: string) => void;
  cursor: (position: Position) => void;
  selection: (range: EditorSelection) => void;
};

export const useCodeEditor = (language: string, cursors: Cursor[], selections: Selection[], reflectors: Reflectors) => {
  const compositioning = useRef(false);

  const effects = useCallback(() => {
    useEffect(() => {
      const instance = instanceRef.current;
      if (instance != null)
        return instance.onDidChangeModelContent(ev => {
          if (!compositioning.current) reflectors.edits(ev.changes, instance.getValue());
          // compositioning is true if the edits is not manual because the APIs run synchronously.
        }).dispose;
    }, [reflectors.edits]);

    useEffect(() => {
      const instance = instanceRef.current;
      if (instance != null)
        return instance.onDidChangeCursorSelection(ev => reflectors.selection(ev.selection)).dispose;
    }, [reflectors.selection]);

    useEffect(() => {
      const instance = instanceRef.current;
      if (instance != null) return instance.onDidChangeCursorPosition(ev => reflectors.cursor(ev.position)).dispose;
    }, [reflectors.cursor]);
  }, [reflectors.edits, reflectors.cursor, reflectors.selection]);

  const [element, instanceRef] = useMonacoEditor(
    {
      value: defaultValue,
      language: language,
    },
    effects
  );

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) setCursorDecorations(instance, cursors);
  }, [cursors]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) setSelectionDecrations(instance, selections);
  }, [selections]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) editor.setModelLanguage(instance.getModel()!, language);
  }, [language]);

  const getCode = useCallback(() => instanceRef.current?.getValue(), []);

  const execEdits = useCallback((ops: editor.IIdentifiedSingleEditOperation[]) => {
    return new Promise(resolve => {
      const f = () => {
        if (instanceRef.current != null) {
          compositioning.current = true;
          resolve(instanceRef.current.executeEdits('coding-chat', ops));
          compositioning.current = false;
        } else setTimeout(f);
      };
      f();
    });
  }, []);

  const setValue = useCallback((value: string) => {
    const f = () => {
      if (instanceRef.current != null) {
        compositioning.current = true;
        instanceRef.current.setValue(value);
        compositioning.current = false;
      } else setTimeout(f);
    };
    f();
  }, []);

  return [element, getCode, execEdits, setValue] as const;
};

const setCursorDecorations = (instance: editor.IStandaloneCodeEditor, cursors: Cursor[]) => {
  const range = new Range(0, 0, instance.getModel()!.getLineCount() + 1, 0);
  const oldCursorDecorations = (instance.getDecorationsInRange(range) ?? [])
    .filter(decoration => decoration.options.className?.startsWith(cursorSuffix))
    .map(decoration => decoration.id);
  const newCursorDecorations = cursors.map(({ line, column, uid, name }) => ({
    range: new Range(line, column, line, column),
    options: {
      className: [cursorSuffix, suffix + '-' + uid, suffix + '-' + uid + '-bg'].join(' '),
      stickiness: 1,
      hoverMessage: { value: name },
    },
  }));
  instance.deltaDecorations(oldCursorDecorations, newCursorDecorations);
};

const setSelectionDecrations = (instance: editor.IStandaloneCodeEditor, selections: Selection[]) => {
  const range = new Range(0, 0, instance.getModel()!.getLineCount() + 1, 0);
  const oldSelectionDecorations = (instance.getDecorationsInRange(range) ?? [])
    .filter(decoration => decoration.options.className?.startsWith(selectionSuffix))
    .map(v => v.id);
  const newSelectionDecorations = selections.map(({ startLine, startColumn, endLine, endColumn, uid, name }) => ({
    range: new Range(startLine, startColumn, endLine, endColumn),
    options: {
      className: [selectionSuffix, suffix + '-' + uid, suffix + '-' + uid + '-bg'].join(' '),
      hoverMessage: { value: name },
    },
  }));
  instance.deltaDecorations(oldSelectionDecorations, newSelectionDecorations);
};
