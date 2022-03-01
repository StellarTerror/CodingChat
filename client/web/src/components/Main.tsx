import { Layout, Model, TabNode } from 'flexlayout-react';
import { FC, useCallback, useState, VFC } from 'react';
import { useTextEditor, useReadonlyTextEditor } from '~/components/editor/TextEditor';
import { Loadable } from '~/scripts/promise';
import { ChatConnection, useChatConnection } from '~/scripts/chat-connection';
import { useCodeEditor } from '~/components/editor/CodeEditor';
import { Header } from '~/components/Header';
import { run } from '~/scripts/code-run';
import { Link } from '@tanstack/react-location';
import ChatView from './Chat';
import { editor, Position, Selection } from 'monaco-editor';

const flexLayoutModel = Model.fromJson({
  global: {},
  borders: [],
  layout: {
    type: 'row',
    children: [
      {
        type: 'row',
        weight: 75,
        children: [
          {
            type: 'row',
            weight: 80,
            children: [
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    enableClose: false,
                    name: 'CodeEditor',
                    component: 'code-editor',
                  },
                ],
              },
            ],
          },
          {
            type: 'row',
            weight: 20,
            children: [
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    name: 'Log',
                    component: 'log-editor',
                    enableClose: false,
                  },
                ],
              },
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    name: 'Input',
                    component: 'input-editor',
                    enableClose: false,
                  },
                ],
              },
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    name: 'Output',
                    component: 'output-editor',
                    enableClose: false,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'row',
        weight: 25,
        children: [
          {
            type: 'tabset',
            children: [
              {
                type: 'tab',
                name: 'Chat',
                component: 'chat',
                enableClose: false,
              },
            ],
          },
        ],
      },
    ],
  },
});
type FlexLayoutComponentName = 'chat' | 'log-editor' | 'input-editor' | 'output-editor' | 'code-editor';

export const Main: VFC<{ chatConnection: Loadable<ChatConnection> }> = ({ chatConnection }) => {
  const conn = chatConnection.get();

  const reflectors = {
    edits: useCallback(
      (changes: editor.IModelContentChange[], full_text: string) => {
        const now = Date.now();
        if (now > +conn.lastSync + 25) {
          conn.sendMessage({ type: 'edit', data: { changes, timestamp: now, full_text } });
        }
      },
      [conn]
    ),
    cursor: useCallback((position: Position) => conn.sendMessage({ type: 'cursormove', data: position }), []),
    selection: useCallback((selection: Selection) => conn.sendMessage({ type: 'selection', data: selection }), []),
  };

  const chat = useCallback((message: string) => conn.sendMessage({ type: 'chat', data: message }), [conn]);

  const applyEdits = useCallback((changes: editor.IModelContentChange[]) => {
    execEdits(changes);
  }, []);

  const [language, languageSelect] = useLanguageSelect();
  const [messages, cursors, selections] = useChatConnection(conn, applyEdits);
  const [codeEditor, getCode, execEdits] = useCodeEditor(language, cursors, selections, reflectors);
  const [logView, setLog] = useReadonlyTextEditor();
  const [stdinEditor, , getStdin] = useTextEditor();
  const [stdoutView, setStdout] = useReadonlyTextEditor();

  const factory = useCallback(
    (node: TabNode) => {
      const component = node.getComponent() as FlexLayoutComponentName;
      switch (component) {
        case 'code-editor':
          return codeEditor;
        case 'log-editor':
          return logView;
        case 'input-editor':
          return stdinEditor;
        case 'output-editor':
          return stdoutView;
        case 'chat':
          return <ChatView messages={messages} send={chat} />;
        default:
          return <span>unresolved component</span>;
      }
    },
    [language, cursors, selections]
  );

  const execute = useCallback(async () => {
    const code = getCode();
    const stdin = getStdin();
    if (code == null) throw Error('no code editor instance');
    if (stdin == null) throw Error('no input editor instance');
    const [log, stdout] = await run(code, stdin, language === 'cpp' ? 'C++' : 'Python');
    setLog(log);
    setStdout(stdout);
  }, [language]);

  return (
    <div>
      <Header>
        {languageSelect}
        <ExecuteButton execute={execute} />
        <Link to='/'>退室</Link>
      </Header>
      <Layout model={flexLayoutModel} factory={factory} />
    </div>
  );
};

const useLanguageSelect = () => {
  const [language, setLanguage] = useState<'cpp' | 'python'>('cpp');

  const selectElement = (
    <select value={language} onChange={ev => setLanguage(ev.target.value as any)}>
      <option value='cpp'>C++</option>
      <option value='python'>Python3</option>
    </select>
  );
  return [language, selectElement] as const;
};

const ExecuteButton: FC<{ execute: () => Promise<void> }> = ({ execute }) => {
  const [executing, setExecuting] = useState(false);
  const onClick = () => {
    setExecuting(true);
    execute().finally(() => {
      setExecuting(false);
    });
  };

  return (
    <button onClick={onClick} disabled={executing}>
      {executing ? '実行中' : '実行'}
    </button>
  );
};
