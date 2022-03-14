import type { IPosition, IRange, editor } from 'monaco-editor';

export type FullText = string;
export type ConnectionKey = string;

export type OutboundEditorCommand =
  | {
      type: 'cursormove';
      data: IPosition;
    }
  | {
      type: 'selection';
      data: IRange;
    }
  | {
      type: 'edit';
      data: {
        changes: editor.IModelContentChange[];
        timestamp: number;
        full_text: FullText;
      };
    };
export type OutboundChat = {
  type: 'chat';
  data: string;
};
export type OutboundMessage = OutboundEditorCommand | OutboundChat;

export type InboundEditorCommand = OutboundEditorCommand & { key: ConnectionKey; name: string };
export type InboundChat = OutboundChat & { key: ConnectionKey; name: string };
export type InboundConnectionInfo = { key: ConnectionKey; name: string } & (
  | {
      type: 'connect';
      data: FullText;
    }
  | {
      type: 'disconnect';
      data: '';
    }
);
export type InboundMessage = InboundEditorCommand | InboundChat | InboundConnectionInfo;

export type EditorCommand =
  | {
      type: 'onconnect';
      fullText: string;
    }
  | {
      type: 'edit';
      changes: editor.IModelContentChange[];
    }
  | {
      type: 'cursormove';
      position: IPosition;
      uid: ConnectionKey;
      name: string;
    }
  | {
      type: 'selection';
      range: IRange;
      uid: ConnectionKey;
      name: string;
    }
  | {
      type: 'clean';
      uid: ConnectionKey;
  };

export type ChatMessage =
  | {
      type: 'chat';
      content: string;
      date: Date;
      uid: ConnectionKey;
      name: string;
    }
  | {
      type: 'info';
      content: string;
      date: Date;
    };
