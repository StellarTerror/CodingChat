import { base64ToBase62 } from '../utils';
import { ChatMessage, EditorCommand, InboundMessage } from './types';
import { inboundMessageValidator } from './validator';

export const strToInboundMessage = (str: string) => {
  const data = JSON.parse(str) as unknown;

  if (!inboundMessageValidator(data)) return undefined;
  data.key = base64ToBase62(data.key);

  return data;
};

export const pickAndTransformInboundChat = (
  message: InboundMessage & { timestamp: number }
): ChatMessage | undefined => {
  switch (message.type) {
    case 'chat': {
      const { data, timestamp, name, key } = message;
      return {
        type: 'chat',
        content: data,
        date: new Date(timestamp),
        uid: key,
        name,
      };
    }
    case 'connect': {
      const { timestamp, name } = message;
      return {
        type: 'info',
        content: name + 'が接続しました',
        date: new Date(timestamp),
      };
    }
    case 'disconnect': {
      const { timestamp, name } = message;
      return {
        type: 'info',
        content: name + 'が切断しました',
        date: new Date(timestamp),
      };
    }
  }
};

export const pickAndTransformEditorCommand = (message: InboundMessage): EditorCommand | undefined => {
  switch (message.type) {
    case 'connect': {
      return {
        type: 'onconnect',
        fullText: message.data,
      };
    }
    case 'disconnect': {
      return {
        type: 'clean',
        uid: message.key,
      }
    }
    case 'edit': {
      return {
        type: 'edit',
        changes: message.data.changes,
      };
    }
    case 'cursormove': {
      const { data, key, name } = message;
      return {
        type: 'cursormove',
        position: data,
        uid: key,
        name,
      };
    }
    case 'selection': {
      const { data, key, name } = message;
      return {
        type: 'selection',
        range: data,
        uid: key,
        name,
      };
    }
  }
};
