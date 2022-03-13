import { VFC, Suspense, useState, MouseEvent } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-location';
import { Header } from '~/components/Header';
import { Loadable, useLoad } from '~/scripts/promise';
import { RoomList, getRoomList, createRoom } from '~/scripts/room-api';
import styled from 'styled-components';
import { BlueButton, blueButtonCss } from '~/components/Button';

const tickets = new Map<string | undefined, symbol>();
const getTickets = (pageKey: string | undefined) => {
  if (!tickets.has(pageKey)) tickets.set(pageKey, Symbol());
  return tickets.get(pageKey) as symbol;
}

export const Welcome = styled<VFC>(props => {
  const location = useLocation();
  const roomList = useLoad(getTickets(location.current.key), getRoomList);
  return (
    <main {...props}>
      <Header />
      <div>
        <section>
          CodingChatはオンラインでのペアプログラミングを支援するサービスです。
          <br />
          誰でも無料でオンラインでコードを共同編集し実行することができます。
        </section>
        <section>
          <Suspense fallback={null}>
            <h2>公開部屋一覧</h2>
            <div>
              <Rooms roomList={roomList} />
            </div>
          </Suspense>
        </section>
        <NewRoom />
      </div>
    </main>
  );
})`
  > div:last-child {
    padding-block: 2em;
    text-align: center;
    > * {
      padding: 2em 0.5em;
    }
    > section:nth-child(2) > h2 {
      font-size: 1.25em;
      + div {
        margin-inline: auto;
        max-width: 30em;
      }
    }
  }
`;

const Rooms = styled<VFC<{ roomList: Loadable<RoomList> }>>(({ roomList, ...rest }) => {
  const list = roomList.get();
  return list.length === 0 ? (
    <p {...rest}>no rooms</p>
  ) : (
    <ul {...rest}>
      {list.map(({ name, id, participantsNumber }) => (
        <li key={id}>
          <div>
            <h3>{name}</h3>
            <span>{participantsNumber}人接続中</span>
          </div>
          <Link to={'/chat/' + id}>入室</Link>
        </li>
      ))}
    </ul>
  );
})`
  padding: 0;
  list-style: none;
  > li {
    display: flex;
    align-items: center;
    border: 1px solid #ccc;
    border-bottom: 0;
    :last-child {
      border-bottom: 1px solid #ccc;
    }
    padding: 0 1rem;
    > div {
      padding: 0.5em 0;
      text-align: start;
      flex-grow: 1;
      > h3 {
        font-weight: bold;
      }
    }
    > a {
      display: block;
      ${blueButtonCss}
      text-decoration: none;
    }
  }
`;

const NewRoom = styled<VFC>(props => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const navigate = useNavigate();

  const create = (ev: MouseEvent) => {
    createRoom(name, isPublic).then(id => navigate({ to: '/chat/' + id }));
    ev.preventDefault();
  };

  return (
    <div {...props}>
      <h2>部屋を新規作成</h2>
      <form>
        <input type='text' value={name} onChange={ev => setName(ev.target.value)} placeholder='部屋名' />
        <label>
          <input type='checkbox' checked={isPublic} onChange={ev => setIsPublic(ev.target.checked)} />
          公開
        </label>
        <BlueButton onClick={create}>作成</BlueButton>
      </form>
      <span>※新しい部屋の作成時に、誰も入っていない部屋は自動的に削除されます。</span>
    </div>
  );
})`
  > h2 {
    font-size: 1.25em;
  }
  > form {
    display: flex;
    align-items: center;
    margin-inline: auto;
    max-width: 30em;
    > input[type='text'] {
      border: 1px solid #ccc;
      padding-inline: 0.5rem;
      font-size: 1em;
      line-height: 2;
      flex-grow: 1;
    }
    > label {
      margin-inline: 0.5em;
    }
  }
  > span {
    font-size: 0.9em;
    line-height: 2;
  }
`;
