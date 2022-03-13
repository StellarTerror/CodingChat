import { useCallback } from 'react';
import { useMonacoEditor } from './Base';

export const useTextEditor = () => {
  const [element, instanceRef] = useMonacoEditor({
    value: '',
    language: 'plaintext',
    minimap: { enabled: false },
    lineNumbers: 'off',
  });

  const setValue = useCallback((value: string) => {
    instanceRef.current?.setValue(value);
  }, []);
  const getValue = useCallback(() => instanceRef.current?.getValue(), []);

  return [element, setValue, getValue] as const;
};

export const useReadonlyTextEditor = () => {
  const [element, instanceRef] = useMonacoEditor({
    value: '',
    language: 'plaintext',
    minimap: { enabled: false },
    lineNumbers: 'off',
    readOnly: true,
  });

  const setValue = useCallback((value: string) => {
    instanceRef.current?.setValue(value);
  }, []);

  return [element, setValue] as const;
};
