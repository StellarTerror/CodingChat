import { useCallback, useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';
import styled from 'styled-components';

export const useMonacoEditor = (
  options: editor.IStandaloneEditorConstructionOptions,
  effects: () => void = () => {}
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<editor.IStandaloneCodeEditor>();

  const Editor = useCallback(() => {
    useEffect(() => {
      if (containerRef.current == null) return;

      const container = containerRef.current;
      const instance = editor.create(container, options);
      instanceRef.current = instance;
      // on_mount(editor);

      const observer = new ResizeObserver(entries => {
        instance.layout(); // checking if this works
        // for (const entry of entries) {
        //   editor.layout(entry.contentRect);
        // }
      });

      observer.observe(container);
      return () => {
        instance.dispose();
        observer.unobserve(container);
      };
    }, []);
    effects();
    return <EditorContainer ref={containerRef} />;
  }, []);

  return [Editor, instanceRef] as const;
};

const EditorContainer = styled.div`
  height: 100%;
`;
