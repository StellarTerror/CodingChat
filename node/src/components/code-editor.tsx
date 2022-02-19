import { languages } from 'monaco-editor';
import React, { useRef, useEffect } from 'react';
import { Editor, Cursor} from './editor';
import * as monaco from 'monaco-editor';

function CodeEditor(props: {name: string, language: string, on_mount: (editor: monaco.editor.IStandaloneCodeEditor) => void, cursors?: Cursor[]}) {
    return (
      <Editor
		editorOptions={{
			value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
			language: props.language,
		}}
		name = {props.name}
		cursors = {props.cursors}
		on_mount = {props.on_mount}
	  />
    );
}

export default CodeEditor;