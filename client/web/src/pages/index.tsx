import { VFC, Fragment, useMemo, Suspense, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-location';
import { Header } from '~/components/Header';
import { Loadable, sync } from '~/scripts/promise';
import { RoomList, getRoomList, createRoom } from '~/scripts/room-api';

export const Welcome: VFC = () => {
  const roomList = useMemo(() => sync(getRoomList()), []);
  return (
    <Fragment>
      <Header />
      <div>
        <div>
          CodingChatはオンラインでのペアプログラミングを支援するサービスです。
          <br />
          誰でも無料でオンラインでコードを共同編集し実行することができます。
        </div>
        <h2>部屋一覧</h2>
        <Suspense fallback={null}>
          <Rooms roomList={roomList} />
        </Suspense>
        <NewRoom />
      </div>
    </Fragment>
  );
};

const Rooms: VFC<{ roomList: Loadable<RoomList> }> = ({ roomList }) => {
  const list = roomList.get();
  return (
    <ul>
      {list.map(({ name, id, participantsNumber }) => (
        <li key={id}>
          <h3>{name}</h3>
          <span>{participantsNumber}人</span>
          <Link to={'/chat/' + id}></Link>
        </li>
      ))}
    </ul>
  );
};

const NewRoom = () => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const navigate = useNavigate();

  const create = () => {
    createRoom(name, isPublic).then(id => navigate({ to: '/chat/' + id }));
  };

  return (
    <div>
      ※新しい部屋の作成時に、誰も入っていない部屋は自動的に削除されます。
      <h4>部屋を新規作成</h4>
      部屋名：
      <input type='text' value={name} onChange={ev => setName(ev.target.value)} />
      <input type='checkbox' checked={isPublic} onChange={ev => setIsPublic(ev.target.checked)} />
      公開
      <button onClick={create}>作成</button>
    </div>
  );
};
