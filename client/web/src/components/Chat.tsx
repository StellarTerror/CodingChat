import { useState, VFC } from 'react';
import { ChatMessage } from '~/scripts/chat-connection';

const Chat: VFC<{ messages: ChatMessage[]; send: (message: string) => void }> = ({ messages, send }) => {
  return (
    <div>
      <ul>
        {messages.map(m => (
          <li key={+m.date}>
            <h4>{m.type === 'chat' ? m.name : 'info'}</h4>
            <p>{m.content}</p>
          </li>
        ))}
      </ul>
      <ChatInput send={send} />
    </div>
  );
};

const ChatInput: VFC<{ send: (message: string) => void }> = ({ send }) => {
  const [message, setMessage] = useState('');
  const onclick = () => {
    send(message);
    setMessage('');
  };
  return (
    <div>
      <input type='text' value={message} onChange={ev => setMessage(ev.target.value)} />
      <button disabled={message === ''} onClick={onclick}>
        送信
      </button>
    </div>
  );
};

export default Chat;
