import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor";
import ReactResizeDetector from "react-resize-detector";

export class Cursor {
  y: number;
  x: number;
  isActive: boolean;
  name: string;
  key: string;
  constructor(
    y: number,
    x: number,
    isActive: boolean,
    name: string,
    key: string
  ) {
    this.y = y;
    this.x = x;
    this.isActive = isActive;
    this.name = name;
    this.key = key;
  }
}

export class Selection {
  startY: number;
  startX: number;
  endY: number;
  endX: number;
  isActive: boolean;
  name: string;
  key: string;
  constructor(
    y1: number,
    x1: number,
    y2: number,
    x2: number,
    isActive: boolean,
    name: string,
    key: string
  ) {
    this.startY = y1;
    this.startX = x1;
    this.endY = y2;
    this.endX = x2;
    this.isActive = isActive;
    this.name = name;
    this.key = key;
  }
}

type EditorProps = {
  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions;
  name: string;
  cursors?: Cursor[];
  on_mount: (editor: monaco.editor.IStandaloneCodeEditor) => void;
};

export class Editor extends React.Component<EditorProps> {
  editor_div: React.RefObject<HTMLDivElement>;
  monaco_editor: monaco.editor.IStandaloneCodeEditor | null;
  constructor(props: EditorProps) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
    };
    this.editor_div = React.createRef();
    this.monaco_editor = null;

    this.handle_rezise = this.handle_rezise.bind(this);
  }

  componentDidMount() {
    if (this.editor_div.current && this.monaco_editor == null) {
      this.monaco_editor = monaco.editor.create(
        this.editor_div.current,
        this.props.editorOptions
      );
      this.props.on_mount(this.monaco_editor);

      if (document.getElementById("cursor-style") == null) {
        document.getElementsByTagName(
          "head"
        )[0].innerHTML += `<style id="${this.props.name}-cursor-style"></style>`;
      }
    }
  }

  componentWillUnmount() {
    this.monaco_editor && this.monaco_editor.dispose();
  }

  handle_rezise(width: number | undefined, height: number | undefined) {
    if (width && height) {
      this.monaco_editor?.layout({ height, width });
    }
  }

  render() {
    return (
      <div className="editor-container" style={{ height: "100%" }}>
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={this.handle_rezise}
          refreshMode="debounce"
          refreshRate={100}
        />
        <div
          className="editor"
          ref={this.editor_div}
          style={{ height: "100%" }}
        />
      </div>
    );
  }
}
