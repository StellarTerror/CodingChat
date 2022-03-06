import { MouseEvent, useEffect, useRef, useState, VFC } from 'react';
import styled from 'styled-components';
import { ChatMessage } from '~/scripts/chat-connection';
import { suffix } from '~/scripts/room-mates';
import { BlueButton } from './Button';

const Chat = styled<VFC<{ messages: ChatMessage[]; send: (message: string) => void }>>(
  ({ messages, send, ...rest }) => {
    const ulRef = useRef<HTMLUListElement>(null);
    useEffect(() => {
      ulRef.current?.scroll({ top: 0, behavior: 'smooth' });
    }, [messages]);

    return (
      <div {...rest}>
        <ChatInput send={send} />
        {messages.length === 0 ? (
          <p>no messages</p>
        ) : (
          <ul ref={ulRef}>
            {messages.map(m => (
              <li key={+m.date}>
                <p>{m.content}</p>
                {m.type !== 'chat' ? <h3>info</h3> : <h3 className={suffix + '-' + m.uid + '-color'}>{m.name}</h3>}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
)`
  display: flex;
  flex-direction: column;
  height: 100%;
  > p {
    font-size: 0.9em;
    text-align: center;
    color: #777;
  }
  > ul {
    list-style: none;
    padding: 0;
    > li {
      border-block-start: 1px solid #ccc;
      :last-child {
        border-block-end: 1px solid #ccc;
      }
      padding-inline: 0.5em;
      > p {
        font-size: 1.25em;
      }
    }
  }
  > *:last-child {
    flex-grow: 1;
    overflow-y: auto;
  }
`;

const ChatInput = styled<VFC<{ send: (message: string) => void }>>(({ send, ...rest }) => {
  const [message, setMessage] = useState('');
  const onclick = (ev: MouseEvent) => {
    ev.preventDefault();
    send(message);
    setMessage('');
  };
  return (
    <form {...rest}>
      <input type='text' value={message} onChange={ev => setMessage(ev.target.value)} />
      <span />
      <BlueButton disabled={message === ''} onClick={onclick}>
        送信
      </BlueButton>
    </form>
  );
})`
  display: flex;
  padding: 0.5em;

  > input {
    flex-grow: 1;
    font-size: 1em;
    border: 1px solid #ccc;
    padding-inline: 0.5em;
  }
  > span {
    padding-inline-start: 0.5em;
  }
  > button {
    flex-shrink: 0;
  }
`;

export default Chat;
