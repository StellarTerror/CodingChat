import { useEffect, useRef } from 'react';
import { editor } from 'monaco-editor';

export const useMonacoEditor = (options: editor.IStandaloneEditorConstructionOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<editor.IStandaloneCodeEditor>();

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

  return [<div ref={containerRef} />, instanceRef] as const;
};
