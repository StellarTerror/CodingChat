import { useMonacoEditor } from './Base';
import { Range, editor, IPosition, IRange } from 'monaco-editor';
import { useCallback, useEffect, useRef } from 'react';
import { cursorSuffix, selectionSuffix, suffix } from '~/scripts/room-mates';
import { WebsocketConnectionManager } from '~/scripts/websocket/connection';
import { readStream } from '~/scripts/utils';
import { pickAndTransformEditorCommand } from '~/scripts/websocket/transformer';
import { ConnectionKey } from '~/scripts/websocket/types';

type Cursor = {
  uid: ConnectionKey;
  name: string;
  position: IPosition;
};
type Selection = {
  uid: ConnectionKey;
  name: string;
  range: IRange;
};

const defaultValue = ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n');

export const useCodeEditor = (conn: WebsocketConnectionManager, language: string) => {
  const compositioning = useRef(false);

  const effects = useCallback(() => {
    useEffect(() => {
      const instance = instanceRef.current;
      if (instance == null) {
        console.warn('the instance of the code editor has not yet been created');
        return;
      }

      const cleaners = [
        instance.onDidChangeModelContent(({ changes }) => {
          if (!compositioning.current)
            conn.sendMessage({
              type: 'edit',
              data: {
                changes,
                timestamp: Date.now(),
                full_text: instance.getValue(),
              },
            });
        }).dispose,
        instance.onDidChangeCursorPosition(({ position }) => {
          conn.sendMessage({ type: 'cursormove', data: position });
        }).dispose,
        instance.onDidChangeCursorSelection(({ selection }) => {
          conn.sendMessage({ type: 'selection', data: selection });
        }).dispose,
      ];

      return () => cleaners.forEach(f => f());
    }, []);

    useEffect(() => {
      const instance = instanceRef.current;
      if (instance == null) {
        console.warn('the instance of the code editor has not yet been created');
        return;
      }

      let cursors: Cursor[] = [];
      let selections: Selection[] = [];
      let first = true;

      readStream(conn.getMessageStream().getReader(), message => {
        const command = pickAndTransformEditorCommand(message);
        if (command == null) return;

        switch (command.type) {
          case 'cursormove': {
            const { uid, name, position } = command;
            cursors = cursors.filter(v => v.uid !== uid).concat({ uid, name, position });
            setCursorDecorations(instance, cursors);
            break;
          }
          case 'selection': {
            const { uid, name, range } = command;
            selections = selections.filter(v => v.uid !== uid).concat({ uid, name, range });
            setSelectionDecrations(instance, selections);
            break;
          }
          case 'edit': {
            const { changes } = command;
            compositioning.current = true;
            instance.executeEdits('coding-chat', changes);
            compositioning.current = false;
            break;
          }
          case 'onconnect': {
            if (!first) break;
            const { fullText } = command;
            compositioning.current = true;
            instance.setValue(fullText);
            compositioning.current = false;
            first = false;
            break;
          }
          case 'clean': {
            const { uid } = command;
            cursors = cursors.filter(v => v.uid !== uid);
            selections = selections.filter(v => v.uid !== uid);
            setCursorDecorations(instance, cursors);
            setSelectionDecrations(instance, selections);
            break;
          }
        }
      });
    }, []);
  }, []);

  const [element, instanceRef] = useMonacoEditor(
    {
      value: defaultValue,
      language: language,
    },
    effects
  );

  useEffect(() => {
    const instance = instanceRef.current;
    if (instance != null) editor.setModelLanguage(instance.getModel()!, language);
  }, [language]);

  const getCode = useCallback(() => instanceRef.current?.getValue(), []);

  return [element, getCode] as const;
};

const setCursorDecorations = (instance: editor.IStandaloneCodeEditor, cursors: Cursor[]) => {
  const range = new Range(0, 0, instance.getModel()!.getLineCount() + 1, 0);
  const oldCursorDecorations = (instance.getDecorationsInRange(range) ?? [])
    .filter(decoration => decoration.options.className?.startsWith(cursorSuffix))
    .map(decoration => decoration.id);
  const newCursorDecorations = cursors.map(({ uid, name, position: { lineNumber, column } }) => ({
    range: new Range(lineNumber, column, lineNumber, column),
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
  const newSelectionDecorations = selections.map(({ uid, name, range }) => ({
    range,
    options: {
      className: [selectionSuffix, suffix + '-' + uid, suffix + '-' + uid + '-bg'].join(' '),
      hoverMessage: { value: name },
    },
  }));
  instance.deltaDecorations(oldSelectionDecorations, newSelectionDecorations);
};
