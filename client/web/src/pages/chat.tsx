import { VFC, useState, useMemo, Suspense } from 'react';
import { Main } from '~/components/Main';
import { sync } from '~/scripts/promise';
import { open } from '~/scripts/chat-connection';
import { Link, useMatch } from '@tanstack/react-location';
import { LocationGenerics } from '~/components/App';
import { RoomInfo } from '~/scripts/room-api';

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

const Entrance: VFC<{ roomInfo: RoomInfo | undefined; set: (name: string) => void }> = ({ roomInfo, set }) => {
  const [userName, setUserName] = useState('');

  return roomInfo == null ? (
    <div>
      <p>部屋が存在しません</p>
      <Link to='/'>戻る </Link>
    </div>
  ) : (
    <div>
      <h2>部屋名: {roomInfo.name}</h2>
      <section>
        <h3>名前を入力してください</h3>
        <input type='text' value={userName} onChange={ev => setUserName(ev.target.value)} placeholder='名前' />
        <button onClick={() => set(userName)} disabled={userName === ''}>
          入室
        </button>
      </section>
    </div>
  );
};
