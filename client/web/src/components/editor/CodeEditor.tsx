import { useMonacoEditor } from './Base';
import { Range, editor, Position, Selection as EditorSelection } from 'monaco-editor';
import { useCallback, useEffect } from 'react';
import { Cursor, Selection } from '~/scripts/chat-connection';
import { cursorSuffix, selectionSuffix } from '~/scripts/room-mates';

const defaultValue = ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n');

type Reflectors = {
  edits: (chages: editor.IModelContentChange[], fullText: string) => void;
  cursor: (position: Position) => void;
  selection: (range: EditorSelection) => void;
};

export const useCodeEditor = (language: string, cursors: Cursor[], selections: Selection[], reflectors: Reflectors) => {
  const [element, instanceRef] = useMonacoEditor({
    value: defaultValue,
    language: language,
  });

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

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null)
      return instance.onDidChangeModelContent(ev => reflectors.edits(ev.changes, instance.getValue())).dispose;
  }, [reflectors.edits]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) return instance.onDidChangeCursorPosition(ev => reflectors.cursor(ev.position)).dispose;
  }, [reflectors.cursor]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) return instance.onDidChangeCursorSelection(ev => reflectors.selection(ev.selection)).dispose;
  }, [reflectors.selection]);

  const getCode = useCallback(() => instanceRef.current?.getValue(), []);

  const execEdits = useCallback((ops: editor.IIdentifiedSingleEditOperation[]) => {
    return instanceRef.current?.executeEdits('', ops);
  }, []);

  return [element, getCode, execEdits] as const;
};

const setCursorDecorations = (instance: editor.IStandaloneCodeEditor, cursors: Cursor[]) => {
  const range = new Range(0, 0, instance.getModel()!.getLineCount() + 1, 0);
  const oldCursorDecorations = (instance.getDecorationsInRange(range) ?? [])
    .filter(decoration => decoration.options.className?.startsWith(cursorSuffix))
    .map(decoration => decoration.id);
  const newCursorDecorations = cursors.map(({ line, column, uid, name }) => ({
    range: new Range(line, column, line, column),
    options: {
      className: cursorSuffix + '-' + uid,
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
      className: selectionSuffix + '-' + uid,
      hoverMessage: { value: name },
    },
  }));
  instance.deltaDecorations(oldSelectionDecorations, newSelectionDecorations);
};
