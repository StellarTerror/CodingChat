import React, { useRef, useEffect } from 'react';
import { Editor, Cursor } from './editor';
import * as monaco from 'monaco-editor';

export function TextEditor(props: {name: string, on_mount: (editor: monaco.editor.IStandaloneCodeEditor) => void, cursors?: Cursor[]}) {
	return (
	  <Editor
	  	editorOptions={{
			value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
			language: 'plaintext',
			minimap: { enabled: false },
			lineNumbers: 'off',
		}}
		name = {props.name}
		cursors = {props.cursors}
		on_mount = {props.on_mount}
	  />
	);
}

export function ReadOnlyTextEditor(props: {name: string, on_mount: (editor: monaco.editor.IStandaloneCodeEditor) => void, cursors?: Cursor[]}) {
	return (
		<Editor
			editorOptions={{
				value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
				language: 'plaintext',
				lineNumbers: 'off',
				minimap: { enabled: false },
				readOnly: true,
			}}
			name = {props.name}
			cursors = {props.cursors}
			on_mount = {props.on_mount}
		/>
	);
}