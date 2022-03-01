import type { IPosition, IRange, editor } from 'monaco-editor';
import { useLayoutEffect, useState } from 'react';
import { Room } from './room-mates';
import { str2hex } from './utils';

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
      key: ConnectionKey;
    }
  | {
      type: 'info';
      date: Date;
      content: string;
    };

type Subscriber = (message: InboundMessage, timestamp: number) => void;
export class ChatConnection {
  private subscribers: Set<Subscriber>;
  private room: Room;
  #lastSync: Date;

  constructor(private socket: WebSocket) {
    this.subscribers = new Set();
    this.room = new Room();
    this.#lastSync = new Date();
    this.socket.addEventListener('message', ev => {
      const { data, timeStamp } = ev;

      if ('string' === typeof data) {
        const message = JSON.parse(data) as InboundMessage;
        message.key = message.key.replaceAll(/=+$/, '');

        if (message.type === 'edit') this.#lastSync = new Date(message.data.timestamp);
        if (message.type === 'connect') this.room.joined(message.key, message.name);
        if (message.type === 'disconnect') this.room.left(message.key);

        this.subscribers.forEach(sub => sub(message, timeStamp));
      }
    });
  }

  sendMessage(message: OutboundMessage) {
    this.socket.send(JSON.stringify(message));
  }
  close() {
    this.socket.close();
  }
  subscribe(subsciber: Subscriber) {
    this.subscribers.add(subsciber);
    return () => this.unsubscribe(subsciber);
  }
  unsubscribe(subsciber: Subscriber) {
    this.subscribers.delete(subsciber);
  }

  get lastSync() {
    return this.#lastSync;
  }
}

export const open = (roomId: string, name: string) =>
  new Promise<ChatConnection>(resolve => {
    const sock = new WebSocket(endpoint + roomId + '?name=' + str2hex(name));
    sock.onopen = () => {
      resolve(new ChatConnection(sock));
    };
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
  updateEditor: (changes: editor.IModelContentChange[]) => void
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [cursors, setCursors] = useState<Cursor[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);

  useLayoutEffect(() => {
    const pushMessage = (message: ChatMessage) => {
      setMessages(messages => [message, ...messages]);
    };
    return conn.subscribe((message, timestamp) => {
      switch (message.type) {
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
          const { key, name, data } = message;
          pushMessage({
            type: 'chat',
            key,
            name,
            content: data,
            date: new Date(timestamp),
          });
          break;
        }
        case 'connect': {
          const { name } = message;
          // TODO: load full text when connectng
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
  }, []);

  return [messages, cursors, selections] as const;
};
