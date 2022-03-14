import { useEffect, useState } from 'react';
import { readStream } from '../utils';
import { WebsocketConnectionManager } from './connection';
import { pickAndTransformInboundChat } from './transformer';
import { ChatMessage } from './types';

export const useChat = (conn: WebsocketConnectionManager) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    readStream(conn.getMessageStream().getReader(), message => {
      const chat = pickAndTransformInboundChat(message);

      if (chat != null) setMessages(messages => [chat, ...messages]);
    });
  }, []);

  return messages;
};
