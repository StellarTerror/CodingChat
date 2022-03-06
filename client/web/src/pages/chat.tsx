import { VFC, useState, useMemo, Suspense, MouseEvent } from 'react';
import { Main } from '~/components/Main';
import { sync } from '~/scripts/promise';
import { open } from '~/scripts/chat-connection';
import { Link, useMatch } from '@tanstack/react-location';
import { LocationGenerics } from '~/components/App';
import { RoomInfo } from '~/scripts/room-api';
import styled from 'styled-components';
import { BlueButton } from '~/components/Button';

export const ChatPage: VFC = () => {
  const {
    data: { roomInfo },
  } = useMatch<LocationGenerics>();

  const [userName, setUserName] = useState<string>();
  const chatConnection = useMemo(() => {
    if (userName != null && roomInfo != null) return sync(open(roomInfo.id, userName));
  }, [userName]);

  return chatConnection == null ? (
    <Entrance set={setUserName} roomInfo={roomInfo} />
  ) : (
    <Suspense fallback={<p>connecting</p>}>
      <Main chatConnection={chatConnection} />
    </Suspense>
  );
};

const Entrance = styled<VFC<{ roomInfo: RoomInfo | undefined; set: (name: string) => void }>>(
  ({ roomInfo, set, ...rest }) => {
    const [userName, setUserName] = useState('');
    const onClick = (ev: MouseEvent) => {
      ev.preventDefault();
      set(userName);
    };

    return roomInfo == null ? (
      <div {...rest}>
        <h2>部屋が存在しません</h2>
        <section>
          <Link to='/'>戻る </Link>
        </section>
      </div>
    ) : (
      <div {...rest}>
        <h2>部屋名： {roomInfo.name}</h2>
        <form>
          <input type='text' value={userName} onChange={ev => setUserName(ev.target.value)} placeholder='名前' />
          <span />
          <BlueButton onClick={onClick} disabled={userName === ''}>
            OK
          </BlueButton>
        </form>
      </div>
    );
  }
)`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  > h2 {
    font-size: 1.25em;
  }
  > form {
    display: flex;
    align-items: center;
    margin-inline: auto;
    padding: 0.5em;
    max-width: 30em;
    > input {
      border: 1px solid #ccc;
      padding-inline: 0.5rem;
      font-size: 1em;
      line-height: 2;
      flex-grow: 1;
    }
    > span {
      padding: 0.25em;
    }
  }
`;
