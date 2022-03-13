import type { IPosition, IRange, editor } from 'monaco-editor';
import { useLayoutEffect, useState } from 'react';
import { Room } from './room-mates';
import { base64ToBase62, str2hex } from './utils';

const endpoint = 'ws://' + window.location.host + '/api/ws/';

type FullText = string;
type ConnectionKey = string;
type OutboundMessage =
  | {
      type: 'chat';
      data: string;
    }
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

type InboundMessage =
  | (OutboundMessage & { key: ConnectionKey; name: string })
  | {
      type: 'connect';
      key: ConnectionKey;
      name: string;
      data: FullText;
    }
  | {
      type: 'disconnect';
      key: ConnectionKey;
      name: string;
      data: '';
    };

export type ChatMessage =
  | {
      type: 'chat';
      name: string;
      date: Date;
      content: string;
      uid: ConnectionKey;
    }
  | {
      type: 'info';
      date: Date;
      content: string;
    };

export class ChatConnection {
  private room: Room;
  private destructors: Set<() => void>;
  private messageStream: ReadableStream<InboundMessage & { timestamp: number }>;

  constructor(private socket: WebSocket) {
    this.room = new Room();
    this.destructors = new Set();
    socket.addEventListener('close', () => {
      this.destructors.forEach(f => f());
    });

    this.messageStream = new ReadableStream({
      start: controller => {
        socket.addEventListener('message', (ev: MessageEvent<unknown>) => {
          const { data, timeStamp: timestamp } = ev;
          if ('string' === typeof data) {
            const message = JSON.parse(data) as InboundMessage; // TODO: validate
            message.key = base64ToBase62(message.key);

            if (message.type === 'disconnect') this.room.left(message.key);
            else this.room.joined(message.key, message.name);

            controller.enqueue(Object.assign(message, { timestamp }));
          }
        });
      },
    });
  }

  sendMessage(message: OutboundMessage) {
    this.socket.send(JSON.stringify(message));
  }
  close() {
    this.socket.close();
  }
  getMessageStream() {
    const [s1, s2] = this.messageStream.tee();
    this.messageStream = s1;
    return s2;
  }
}

export const open = (roomId: string, name: string) =>
  new Promise<ChatConnection>(resolve => {
    const sock = new WebSocket(endpoint + roomId + '?name=' + str2hex(name));
    const conn = new ChatConnection(sock);
    sock.addEventListener('open', () => resolve(conn));
    sock.addEventListener('error', console.error);
  });

export type Cursor = {
  line: number;
  column: number;
  name: string;
  uid: string;
  // active: boolean;
};

export type Selection = {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  name: string;
  uid: string;
};

export const useChatConnection = (
  conn: ChatConnection,
  updateEditor: (changes: editor.IModelContentChange[]) => void,
  setEditorValue: (value: string) => void
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  useLayoutEffect(() => {
    const pushMessage = (message: ChatMessage) => {
      setMessages(messages => [message, ...messages]);
    };
    const reader = conn.getMessageStream().getReader();
    read(reader, message => {
      const { type, timestamp } = message;

      switch (type) {
        case 'edit': {
          updateEditor(message.data.changes);
          break;
        }
        case 'cursormove': {
          const { key: uid, name, data } = message;
          setCursors(cursors =>
            cursors
              .filter(v => v.uid !== uid)
              .concat({
                uid,
                name,
                line: data.lineNumber,
                column: data.column,
              })
          );
          break;
        }
        case 'selection': {
          const { key: uid, name, data } = message;
          setSelections(selections =>
            selections
              .filter(v => v.uid !== uid)
              .concat({
                uid,
                name,
                startLine: data.startLineNumber,
                startColumn: data.startColumn,
                endLine: data.endLineNumber,
                endColumn: data.endColumn,
              })
          );
          break;
        }
        case 'chat': {
          const { key: uid, name, data } = message;
          pushMessage({
            type: 'chat',
            uid,
            name,
            content: data,
            date: new Date(timestamp),
          });
          break;
        }
        case 'connect': {
          const { name, data: fullText } = message;
          setEditorValue(fullText);
          pushMessage({
            type: 'info',
            content: name + 'が接続しました',
            date: new Date(timestamp),
          });
          break;
        }
        case 'disconnect': {
          const { key: uid, name } = message;
          setCursors(cursors => cursors.filter(c => c.uid !== uid));
          setSelections(selections => selections.filter(f => f.uid !== uid));
          pushMessage({
            type: 'info',
            content: name + 'が切断しました',
            date: new Date(timestamp),
          });
          break;
        }
      }
    });
    return () => {
      conn.close();
    };
  }, []);

  return [messages, cursors, selections] as const;
};

const read = <T>(reader: ReadableStreamDefaultReader<T>, processor: (chunk: T) => void | Promise<void>) => {
  const handler = async (result: ReadableStreamDefaultReadResult<T>): Promise<undefined> => {
    if (result.done) return;

    await processor(result.value);
    return reader.read().then(handler);
  }
  return reader.read().then(handler);
};
