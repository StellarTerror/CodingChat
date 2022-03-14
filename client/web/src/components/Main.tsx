import { Layout, Model, TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { FC, useCallback, useState, VFC } from 'react';
import { useTextEditor, useReadonlyTextEditor } from '~/components/editor/TextEditor';
import { Loadable } from '~/scripts/promise';
import { useCodeEditor } from '~/components/editor/CodeEditor';
import { Header } from '~/components/Header';
import { run } from '~/scripts/code-run';
import { Link } from '@tanstack/react-location';
import ChatView from './Chat';
import styled from 'styled-components';
import { PlaneButton, planeButtonCss } from './Button';
import { WebsocketConnectionManager } from '~/scripts/websocket/connection';

const flexLayoutModel = Model.fromJson({
  global: {},
  borders: [],
  layout: {
    type: 'row',
    children: [
      {
        type: 'row',
        weight: 80,
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
        weight: 20,
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

export const Main = styled<VFC<{ wsConnection: Loadable<WebsocketConnectionManager> }>>(({ wsConnection, ...rest }) => {
  const conn = wsConnection.get();

  const [language, languageSelect] = useLanguageSelect();
  const [CodeEditor, getCode] = useCodeEditor(conn, language);
  const [LogView, setLog] = useReadonlyTextEditor();
  const [StdinEditor, , getStdin] = useTextEditor();
  const [StdoutView, setStdout] = useReadonlyTextEditor();

  const execute = useCallback(async () => {
    const code = getCode();
    const stdin = getStdin();
    if (code == null) throw Error('no code editor instance');
    if (stdin == null) throw Error('no input editor instance');
    const [stdout, log] = await run(code, stdin, language === 'cpp' ? 'C++' : 'Python');
    setLog(log);
    setStdout(stdout ?? '');
  }, [language]);

  const factory = useCallback(
    (node: TabNode) => {
      const component = node.getComponent() as FlexLayoutComponentName;
      switch (component) {
        case 'code-editor':
          return <CodeEditor />;
        case 'log-editor':
          return <LogView />;
        case 'input-editor':
          return <StdinEditor />;
        case 'output-editor':
          return <StdoutView />;
        case 'chat':
          return <ChatView connection={conn} />;
        default:
          return <span>unresolved component</span>;
      }
    },
    [language]
  );

  return (
    <div {...rest}>
      <Header>
        {languageSelect}
        <ExecuteButton execute={execute} />
        <ExitButton />
      </Header>
      <Layout model={flexLayoutModel} factory={factory} />
    </div>
  );
})`
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hide;

  > *:last-child {
    position: relative;
    flex-grow: 1;
  }
`;

const useLanguageSelect = () => {
  const [language, setLanguage] = useState<'cpp' | 'python'>('cpp');

  const selectElement = (
    <LanguageSelect value={language} onChange={ev => setLanguage(ev.target.value as any)}>
      <option value='cpp'>C++</option>
      <option value='python'>Python3</option>
    </LanguageSelect>
  );
  return [language, selectElement] as const;
};

const LanguageSelect = styled.select`
  border-radius: 0.25em;
  padding: 0.5em;
  margin-inline-end: 0.5em;
  font-size: 1em;
`;

const ExecuteButton: FC<{ execute: () => Promise<void> }> = ({ execute }) => {
  const [executing, setExecuting] = useState(false);
  const onClick = () => {
    setExecuting(true);
    execute().finally(() => {
      setExecuting(false);
    });
  };

  return (
    <PlaneButton onClick={onClick} disabled={executing}>
      {executing ? '実行中' : '▶実行'}
    </PlaneButton>
  );
};

const ExitButton = styled(props => (
  <Link to='/' {...props}>
    退室
  </Link>
))`
  text-decoration: none;
  ${planeButtonCss}
`;
